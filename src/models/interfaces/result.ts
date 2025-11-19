import { PlayerAction, PlayerColor, TurnResult } from "@rd/ludo-rules";

export interface IResult {
  dice: number[];
  action: PlayerAction;
  playerColor: PlayerColor;
  boardState: TurnResult;
}
