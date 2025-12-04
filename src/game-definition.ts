import { PlayerColor } from "@rd/ludo-rules";
import { BoardState } from "@rd/ludo-rules/dist/core-game/board-state.js";
import { Table } from "sc-game-base";
import { IResult } from "./models/interfaces/result.js";

export type GenerateResultData = {
  currentBoardState: BoardState;
  currentTurnIndex: number;
  currentPlayers: PlayerColor[];
  winners: PlayerColor[];
  dice: number[];
};

export default class GameDefinition extends Table.TableGameDefinition {
  declare durations: {
    wholeRound: number;
    wholeRoundWithWinner: number;
    placingBets: number;
    lockingBet: number;
  };

  declare generateResult: (data: GenerateResultData) => Promise<IResult>;
  declare generateOdds: (
    margins: { [key: string]: number },
    currentResult: IResult,
  ) => any;
  constructor(
    gameSettings: any,
    generateResult: (data: GenerateResultData) => any,
    settle: (data: IResult) => any,
    generateRawResultForHash: any,
    generateOdds: (
      margins: { [key: string]: number },
      currentResult: IResult,
    ) => any,
  ) {
    super(gameSettings, generateResult, settle, generateRawResultForHash);
    this.generateResult = generateResult;
    this.settle = settle;
    this.generateOdds = generateOdds;
  }
}
