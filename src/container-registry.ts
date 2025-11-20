import { asClass, asValue } from "awilix";
import { Table } from "sc-game-base";
import { GameCron } from "./crons/game-cron.js";
import {
  RoundConsumer,
  RoundResultConsumer,
  SettleGameRoundConsumer,
} from "./event-consumers/index.js";
import { Rounds } from "./models/index.js";

export default class ContainerRegistry extends Table.TableContainerRegistry {
  registerModels(): void {
    super.registerModels();

    this.container.register({
      roundsRepository: asValue(Rounds),
    });
  }

  registerConsumers(): void {
    super.registerConsumers();

    this.container.register({
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
    });
  }
}
