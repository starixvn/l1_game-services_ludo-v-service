import { Table } from "sc-game-base";
import {
  RoundConsumer,
  RoundResultConsumer,
  SettleGameRoundConsumer,
} from "../event-consumers/index.js";
import GameData from "../game-data.js";
import GameDefinition from "../game-definition.js";

export class GameCron extends Table.Crons.TableGameCron {
  declare bot: Table.Crons.TableGameBot;
  roundConsumer: RoundConsumer;
  declare definition: GameDefinition;
  declare settleGameRoundConsumer: SettleGameRoundConsumer;
  declare gameData: GameData;
  declare roundResultConsumer: RoundResultConsumer;

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
    const { margin } = this.gameData.gameConfigs;
    this.gameData.odds = await this.definition.generateOdds(
      margin,
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
      this.gameData.settlementResultFromAdmin = {};
    } else if (remainingTime < durations.placingBets) {
      this.bot && (await this.bot.run());
      this.runningRoundInfoPublisher.publish();
    }

    await this.promotionFreeSpinsConsumer.checkExpiry(
      this.gameData.gameConfigs.gameId,
    );
  }
}
