import {
  DiceState,
  getActions,
  getRaceMap,
  isGoToStableAction,
  isKickAction,
  isReleaseAction,
  isSkipAction,
  PlayerColor,
} from "@rd/ludo-rules";
import { ODDS_KEYS } from "../constants.js";
import { IResult } from "../models/interfaces/result.js";
import { Odds } from "../types.js";
import { ruleBotInstance } from "./rule-bot-instance.js";

export const generateOdds = async (margin: number, currentResult: IResult) => {
  const oddCounts: Odds = ODDS_KEYS.reduce((acc, key) => {
    acc[key as keyof Odds] = 0;
    return acc;
  }, {} as Odds);
  const raceMap = getRaceMap(currentResult.board);
  for (let i = 1; i <= 6; i++) {
    for (let j = 1; j <= 6; j++) {
      const dices = [i, j];
      const sum = dices[0] + dices[1];
      calculateDiceOdds(sum, oddCounts);
      await calculateActionOdds(dices, currentResult, raceMap, oddCounts);
    }
  }

  return ODDS_KEYS.reduce((acc, key) => {
    acc[key as keyof Odds] = 1 / (oddCounts[key as keyof Odds] / 36) - margin;
    return acc;
  }, {} as Odds);
};

const calculateDiceOdds = (diceSum: number, oddCounts: Odds) => {
  const isBig = diceSum > 6;
  const isEven = diceSum % 2 !== 0;
  oddCounts.big += isBig ? 1 : 0;
  oddCounts.even += isEven ? 1 : 0;
  oddCounts.small += !isBig ? 1 : 0;
  oddCounts.odd += !isEven ? 1 : 0;
};

const calculateActionOdds = async (
  dices: number[],
  currentResult: IResult,
  raceMap: Record<number, PlayerColor>,
  oddCounts: Odds,
) => {
  const diceState = new DiceState(dices);
  const playerColor = currentResult.currentPlayers[currentResult.nextTurnIndex];
  const possibleActions = getActions({
    raceMap,
    boardState: currentResult.board,
    playerColor,
    diceState,
  });
  const action = await ruleBotInstance.move({
    boardState: currentResult.board,
    raceMap,
    playerColor: currentResult.currentPlayers[currentResult.nextTurnIndex],
    diceState,
    possibleActions: possibleActions,
  });
  const skip = isSkipAction(action);
  const release = isReleaseAction(action, playerColor);
  const goStable = isGoToStableAction(action);
  const kick = isKickAction(action, raceMap);
  oddCounts.move += !skip ? 1 : 0;
  oddCounts.release += release ? 1 : 0;
  oddCounts.goStable += goStable ? 1 : 0;
  oddCounts.kick += kick ? 1 : 0;
  oddCounts.noKick += !kick ? 1 : 0;
  oddCounts.noMove += skip ? 1 : 0;
  oddCounts.noRelease += !release ? 1 : 0;
  oddCounts.noStable += !goStable ? 1 : 0;
};
