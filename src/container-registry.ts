import { asClass, asValue } from "awilix";
import { Table } from "sc-game-base";
import { GameCron } from "./crons/game-cron.js";
import { ProcessBetQueue } from "./crons/process-bet-queue.js";
import {
  InGameConsumer,
  PlaceBetConsumer,
  RoundConsumer,
  RoundResultConsumer,
  SettleGameRoundConsumer,
} from "./event-consumers/index.js";
import { RunningRoundInfoPublisher } from "./event-publishers/index.js";
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
      placeBetConsumer: asClass(PlaceBetConsumer).singleton(),
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
      baseBot: asClass(Table.Crons.TableGameConfigBot).singleton(),
      gameCron: asClass(GameCron).singleton().proxy(),
      processBetQueue: asClass(ProcessBetQueue).singleton().proxy(),
    });
  }

  registerPublishers(): void {
    super.registerPublishers();

    this.container.register({
      runningRoundInfoPublisher: asClass(RunningRoundInfoPublisher).singleton(),
    });
  }
}
