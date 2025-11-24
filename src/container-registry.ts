import { asClass, asValue } from "awilix";
import { Table } from "sc-game-base";
import { GameCron } from "./crons/game-cron.js";
import { ProcessBetQueue } from "./crons/process-bet-queue.js";
import {
  InGameConsumer,
  RoundConsumer,
  RoundResultConsumer,
  SettleGameRoundConsumer,
} from "./event-consumers/index.js";
import { BetLogs, Bets, Rounds, TempBets } from "./models/index.js";

export default class ContainerRegistry extends Table.TableContainerRegistry {
  registerModels(): void {
    super.registerModels();

    this.container.register({
      roundsRepository: asValue(Rounds),
      betsRepository: asValue(Bets),
      betLogsRepository: asValue(BetLogs),
      tempBetsRepository: asValue(TempBets),
    });
  }

  registerConsumers(): void {
    super.registerConsumers();

    this.container.register({
      inGameConsumer: asClass(InGameConsumer).singleton(),
      roundConsumer: asClass(RoundConsumer).singleton().proxy(),
      roundResultConsumer: asClass(RoundResultConsumer).singleton(),
      settleGameRoundConsumer: asClass(SettleGameRoundConsumer)
        .singleton()
        .proxy(),
    });
  }

  registerCrons(): void {
    super.registerCrons();

    this.container.register({
      gameCron: asClass(GameCron).singleton().proxy(),
      processBetQueue: asClass(ProcessBetQueue).singleton().proxy(),
    });
  }
}
