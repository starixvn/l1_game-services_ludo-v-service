import {
  isGoToStableAction,
  isReleaseAction,
  isSkipAction,
} from "@rd/ludo-rules";
import { IResult } from "../models/interfaces/result.js";

export const generateSettlementResult = (result: IResult) => {
  const sum = result.dice[0] + result.dice[1];
  const isEven = sum % 2 === 0;
  const isBig = sum > 6;
  const isSkip = isSkipAction(result.action);
  const isRelease = isReleaseAction(result.action, result.action.playerColor);
  const isGoToStable = isGoToStableAction(result.action);
  const isKick = result.kickedPlayer !== undefined;
  return {
    odd: !isEven,
    even: isEven,
    big: isBig,
    small: !isBig,
    move: !isSkip,
    noMove: isSkip,
    release: isRelease,
    noRelease: !isRelease,
    goStable: isGoToStable,
    noStable: !isGoToStable,
    kick: isKick,
    noKick: !isKick,
  };
};
