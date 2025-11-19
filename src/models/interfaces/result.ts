import { PlayerAction, PlayerColor } from "@rd/ludo-rules";
import { BoardState } from "@rd/ludo-rules/dist/core-game/board-state.js";

export interface IResult {
  dice: number[];
  action: PlayerAction;
  playerColor: PlayerColor;
  boardState: BoardState;
  kickedPlayer?: PlayerColor;
}
