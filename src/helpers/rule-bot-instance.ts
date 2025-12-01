import { RuleBot } from "@rd/ludo-rules";

export const ruleBotInstance = new RuleBot({
  homeStartPoints: 9,
  raceRacePoints: 2,
  raceStablePoints: 5,
  stableStablePoints: 3,
  otherStartingPositionPoints: 6,
  inStartingPositionPoints: 4,
  kickOthersPoints: 10,
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
