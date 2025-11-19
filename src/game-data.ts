import { PlayerAction, TurnResult } from "@rd/ludo-rules";
import { Table } from "sc-game-base";

export default class GameData extends Table.TableGameData {
  previousBoardState?: TurnResult;
  currentBoardState?: TurnResult;
  declare gameConfigs: {
    gameId: number;
  };
  declare result: {
    dice: number[];
    action: PlayerAction;
  };
}
