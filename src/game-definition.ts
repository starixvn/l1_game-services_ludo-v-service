import { Table } from "sc-game-base";

export default class GameDefinition extends Table.TableGameDefinition {
  declare durations: {
    wholeRound: number;
    placingBets: number;
    lockingBet: number;
  };
}
