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

  getDataForGenerateResult() {
    return {
      currentBoardState: this.gameData.result.currentBoardState,
      currentTurnIndex: this.gameData.result.currentTurnIndex,
      currentPlayers: this.gameData.result.currentPlayers,
      winners: this.gameData.result.winners,
    };
  }
}
