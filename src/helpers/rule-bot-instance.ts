import { RuleBot } from "@rd/ludo-rules";

export const ruleBotInstance = new RuleBot({
  homeStartPoints: 5,
  raceRacePoints: 2,
  raceStablePoints: 6,
  stableStablePoints: 3,
  otherStartingPositionPoints: 7,
  inStartingPositionPoints: 4,
  kickOthersPoints: 8,
  enterOthersStartingPositionPoints: -1,
  canKickOthersPoints: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  },
  canBeKickedPoints: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  },
});
