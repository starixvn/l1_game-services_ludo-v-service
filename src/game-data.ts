import { PlayerColor } from "@rd/ludo-rules";
import { Table } from "sc-game-base";
import { IResult } from "./models/interfaces/result.js";
import { Odds } from "./types.js";

export default class GameData extends Table.TableGameData {
  declare gameConfigs: {
    gameId: number;
    enabled: boolean;
    odds: {
      margin: number;
    };
    originalOdds: Odds;
    enableFreeBet: boolean;
    boostedChoices: boolean;
  };
  initRoundId: number;
  constructor(remainingTime: number) {
    super(remainingTime);
    this.result = {
      board: {
        [PlayerColor.RED]: [0, 0, 0, 0],
        [PlayerColor.GREEN]: [0, 0, 0, 0],
        [PlayerColor.YELLOW]: [0, 0, 0, 0],
        [PlayerColor.BLUE]: [0, 0, 0, 0],
      },
      nextTurnIndex: 0,
      currentPlayers: [
        PlayerColor.RED,
        PlayerColor.GREEN,
        PlayerColor.YELLOW,
        PlayerColor.BLUE,
      ],
      winners: [],
      dice: [],
      action: {
        oldPosition: 0,
        newPosition: 0,
        playerColor: PlayerColor.RED,
      },
    };
    this.initRoundId = 0;
  }
  declare result: IResult;
  declare odds: Odds;
  declare exchangeRates: { exId: number; code: { [key: string]: number } };
  declare currencyGroupGames: { groupId: number; name: string }[];
  declare ingame: {
    [key: string]: { ownBets: { [key: string]: number }; clientSeed: string };
  };
}
