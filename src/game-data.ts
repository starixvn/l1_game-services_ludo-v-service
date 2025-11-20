import { Table } from "sc-game-base";
import { Result } from "./types.js";

export default class GameData extends Table.TableGameData {
  declare gameConfigs: {
    gameId: number;
  };
  declare result: Result;
}
