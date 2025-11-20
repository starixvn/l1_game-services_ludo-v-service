import { Table } from "sc-game-base";
import GameData from "../game-data.js";

export class SettleGameRoundConsumer extends Table.EventConsumers
  .TableSettleGameRoundConsumer {
  declare gameData: GameData;
}
