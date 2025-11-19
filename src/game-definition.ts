import { PlayerColor } from "@rd/ludo-rules";
import { BoardState } from "@rd/ludo-rules/dist/core-game/board-state.js";
import { Table } from "sc-game-base";

export type GenerateResultData = {
  currentBoardState: BoardState;
  currentTurnIndex: number;
  currentPlayers: PlayerColor[];
};

export default class GameDefinition extends Table.TableGameDefinition {
  declare durations: {
    wholeRound: number;
    placingBets: number;
    lockingBet: number;
  };

  declare generateResult: (data: GenerateResultData) => any;
}
