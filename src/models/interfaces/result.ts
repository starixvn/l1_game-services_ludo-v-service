import { PlayerAction, PlayerColor } from "@rd/ludo-rules";
import { BoardState } from "@rd/ludo-rules/dist/core-game/board-state.js";

export interface IResult {
  board: BoardState;
  nextTurnIndex: number;
  currentPlayers: PlayerColor[];
  winners: PlayerColor[];
  action: PlayerAction;
  dice: number[];
  kickedPlayer?: PlayerColor;
}
