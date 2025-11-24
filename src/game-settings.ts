import { ODDS_KEYS } from "./constants.js";

export default {
  id: 163,
  durations: {
    wholeRound: 32,
    placingBets: 31,
    lockingBet: 14,
  },
  name: "ludo",
  choices: ODDS_KEYS,
  hedgeBetGroups: [
    ["big", "small"],
    ["odd", "even"],
    ["kick", "noKick"],
    ["move", "noMove"],
    ["release", "noRelease"],
    ["goStable", "noStable"],
  ],
};
