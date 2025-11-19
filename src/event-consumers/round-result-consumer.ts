import { Core } from "sc-game-base";
import GameData from "../game-data.js";
import GameDefinition from "../game-definition.js";

export class RoundResultConsumer extends Core.BaseEventConsumers
  .RoundResultConsumer {
  declare gameData: GameData;
  declare definition: GameDefinition;
  async generateResult() {
    const data = this.getDataForGenerateResult();
    this.gameData.result = this.definition.generateResult(data);
  }
}
