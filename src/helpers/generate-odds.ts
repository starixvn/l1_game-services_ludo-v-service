import { ODDS_KEYS } from "../constants.js";
import { IResult } from "../models/interfaces/result.js";
import { Odds } from "../types.js";

export const generateOdds = (margin: number, currentResult: IResult) => {
  const oddCounts: Odds = ODDS_KEYS.reduce((acc, key) => {
    acc[key as keyof Odds] = 0;
    return acc;
  }, {} as Odds);
  for (let i = 1; i <= 6; i++) {
    for (let j = 1; j <= 6; j++) {
      const dices = [i, j];
      const sum = dices[0] + dices[1];
      const isBig = sum > 6;
      const isEven = sum % 2 !== 0;
      oddCounts.big += isBig ? 1 : 0;
      oddCounts.even += isEven ? 1 : 0;
      oddCounts.small += !isBig ? 1 : 0;
      oddCounts.odd += !isEven ? 1 : 0;
    }
  }
  return {
    odd: 1 / (oddCounts.odd / 36) - margin,
    even: 1 / (oddCounts.even / 36) - margin,
    big: 1 / (oddCounts.big / 36) - margin,
    small: 1 / (oddCounts.small / 36) - margin,
  };
};
