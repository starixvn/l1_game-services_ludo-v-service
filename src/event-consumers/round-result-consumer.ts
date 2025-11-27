import { Core } from "sc-game-base";
import GameData from "../game-data.js";
import GameDefinition from "../game-definition.js";
import { generateDice } from "../helpers/index.js";

export class RoundResultConsumer extends Core.BaseEventConsumers
  .RoundResultConsumer {
  declare gameData: GameData;
  declare definition: GameDefinition;

  async generateResult() {
    const data = {
      ...this.getDataForGenerateResult(),
      ...this.resultFromAdmin(),
    };

    this.gameData.result = await this.definition.generateResult(data);
  }

  resultFromAdmin() {
    const { roundId, settlementResultFromAdmin } = this.gameData;
    if (roundId === settlementResultFromAdmin?.roundId) {
      return {
        ...settlementResultFromAdmin?.result,
      };
    }
    return {};
  }

  getDataForGenerateResult() {
    return {
      currentBoardState: this.gameData.result.board,
      currentTurnIndex: this.gameData.result.nextTurnIndex,
      currentPlayers: this.gameData.result.currentPlayers,
      winners: this.gameData.result.winners,
      dice: generateDice(),
    };
  }
}
