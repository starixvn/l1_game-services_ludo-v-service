import { Table } from "sc-game-base";
import {
  RoundConsumer,
  RoundResultConsumer,
  SettleGameRoundConsumer,
} from "../event-consumers/index.js";
import { RunningRoundInfoPublisher } from "../event-publishers/index.js";
import GameData from "../game-data.js";
import GameDefinition from "../game-definition.js";
import { MARGIN_KEYS, ODDS_KEYS } from "../constants.js";

export class GameCron extends Table.Crons.TableGameCron {
  declare bot: Table.Crons.TableGameBot;
  roundConsumer: RoundConsumer;
  declare definition: GameDefinition;
  declare settleGameRoundConsumer: SettleGameRoundConsumer;
  declare gameData: GameData;
  declare roundResultConsumer: RoundResultConsumer;
  declare runningRoundInfoPublisher: RunningRoundInfoPublisher;
  constructor({
    definition,
    gameData,
    bot,
    settleGameRoundConsumer,
    gameStatusPublisher,
    runningRoundInfoPublisher,
    logService,
    roundResultConsumer,
    resultsRepository,
    appConfigs,
    gameManagementApiClientFactory,
    roundIdConsumer,
    provablyFairConsumer,
    unsettledRoundConsumer,
    promotionFreeSpinsConsumer,
    roundConsumer,
  }: any) {
    super({
      definition,
      gameData,
      bot,
      settleGameRoundConsumer,
      gameStatusPublisher,
      runningRoundInfoPublisher,
      logService,
      roundResultConsumer,
      resultsRepository,
      appConfigs,
      gameManagementApiClientFactory,
      roundIdConsumer,
      provablyFairConsumer,
      unsettledRoundConsumer,
      promotionFreeSpinsConsumer,
      roundConsumer,
    } as any);

    this.roundConsumer = roundConsumer;
  }

  async start() {
    await this.bot.resetInRoomTrackings();
    await this.roundConsumer.initNewRound();
    await this.getSettingForNewRound();
    await this.updateExchangeRates();
    this.checkPromotionReadiness();
    await this.promotionFreeSpinsConsumer.loadPromotionsRunning();
    await this.unsettledRoundConsumer.proceed();
    this.startCron();
  }

  async calculateOdds() {
    const odds = this.gameData.gameConfigs.odds;
    const margins = ODDS_KEYS.map((key) => key as keyof typeof odds).reduce(
      (acc, key) => {
        const marginKey = MARGIN_KEYS[key as keyof typeof MARGIN_KEYS];
        acc[key] = odds[marginKey];
        return acc;
      },
      {} as { [key: string]: number },
    );
    this.gameData.odds = await this.definition.generateOdds(
      margins,
      this.gameData.result,
    );
  }

  async proceed() {
    const { durations } = this.definition;
    if (this.gameData.remainingTime === durations.wholeRound) {
      await this.checkGameStatus();
    }

    if (!this.gameData.disabled) {
      this.gameData.remainingTime--;
    }

    const remainingTime = this.gameData.remainingTime;
    if (this.isStartingTime(remainingTime, durations)) {
      this.resetForNewRound();
      await this.calculateOdds();
      await this.runningRoundInfoPublisher.publishInfoForNewRound();
      this.bot && this.bot.reset();
    }

    if (remainingTime === durations.placingBets) {
      this.gameStatusPublisher.publishStartPlacingBetStatus();
    }

    if (remainingTime === durations.lockingBet - 1) {
      this.gameStatusPublisher.publishEndPlacingBetStatus();
    }

    if (remainingTime < 0) {
      this.gameData.remainingTime = durations.wholeRound;
      await this.roundResultConsumer.generateResult();
      await this.settleGameRoundConsumer.settleRound();
      await this.promotionFreeSpinsConsumer.loadPromotionsRunning();
      this.gameData.settlementResultFromAdmin = {} as any;
    } else if (remainingTime < durations.placingBets) {
      this.bot && (await this.bot.run());
      this.runningRoundInfoPublisher.publish();
    }

    await this.promotionFreeSpinsConsumer.checkExpiry(
      this.gameData.gameConfigs.gameId,
    );
  }
}
