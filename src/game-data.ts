import { initSameValue, PlayerAction, PlayerColor } from "@rd/ludo-rules";
import { BoardState } from "@rd/ludo-rules/dist/core-game/board-state.js";
import { Table } from "sc-game-base";

export default class GameData extends Table.TableGameData {
  previousBoardState?: BoardState;
  currentBoardState: BoardState = initSameValue([0, 0, 0, 0]);
  currentTurnIndex: number = 0;
  currentPlayers: PlayerColor[] = [];
  declare gameConfigs: {
    gameId: number;
  };
  declare result: {
    dice: number[];
    action: PlayerAction;
  };
}
