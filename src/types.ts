import { BoardState, PlayerColor } from "@rd/ludo-rules";

export type Result = {
  currentBoardState: BoardState;
  currentTurnIndex: number;
  currentPlayers: PlayerColor[];
  winners: PlayerColor[];
  dice: number[];
};
