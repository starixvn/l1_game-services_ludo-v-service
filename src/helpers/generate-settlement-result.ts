import { IResult } from "../models/interfaces/result.js";

export const generateSettlementResult = (result: IResult) => {
  const sum = result.dice[0] + result.dice[1];
  return {
    odd: sum % 2 === 0,
    even: sum % 2 !== 0,
    big: sum > 3,
    small: sum < 3,
  };
};
