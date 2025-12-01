import { IResult } from "./result.js";
import { ISettlementResult } from "./settlement-result.js";

export interface IRound {
  id: number;
  result: IResult;
  settlementResult: ISettlementResult;
  initRoundId: number;
  time: Date;
  exchangeRateId: number;
  matchId: number;
  margins: { [key: string]: number };
}
