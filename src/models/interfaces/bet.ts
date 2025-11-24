import { ITempBet } from "./temp-bet.js";

export interface IBet extends ITempBet {
  totalAmount: number;
  currency: string;
  rate: number;
}
