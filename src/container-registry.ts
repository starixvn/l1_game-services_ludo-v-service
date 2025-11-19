import { asClass, asValue } from "awilix";
import { Table } from "sc-game-base";
import { RoundConsumer } from "./event-consumers/index.js";
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
    });
  }
}
