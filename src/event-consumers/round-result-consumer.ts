import { Core } from "sc-game-base";
import GameData from "../game-data.js";
import GameDefinition from "../game-definition.js";
import { generateDice } from "../helpers/index.js";
import { convertMarginKeys } from "../helpers/convert-margin-keys.js";

export class RoundResultConsumer extends Core.BaseEventConsumers
  .RoundResultConsumer {
  declare gameData: GameData;
  declare definition: GameDefinition;

  async generateResult() {
    const result = this.resultFromAdmin() as any;
    const data = {
      ...this.getDataForGenerateResult(),
      ...result,
    };

    if (!!result?.currentBoardState) {
      this.gameData.initRoundId = this.gameData.roundId;
      this.gameData.odds = await this.definition.generateOdds(
        convertMarginKeys(this.gameData.gameConfigs.odds),
        {
          board: result.currentBoardState,
          nextTurnIndex: result.currentTurnIndex,
          currentPlayers: result.currentPlayers,
          winners: result.winners,
          dice: result.dice,
          action: result.action,
        },
      );
    }

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
