import { BET_CHOICES, ODDS_KEYS } from "./constants.js";

export default {
  id: 163,
  durations: {
    wholeRoundWithWinner: 42,
    wholeRound: 32,
    placingBets: 17,
    lockingBet: 3,
  },
  name: "ludo",
  choices: ODDS_KEYS,
  hedgeBetGroups: [
    [BET_CHOICES.big, BET_CHOICES.small],
    [BET_CHOICES.odd, BET_CHOICES.even],
    [BET_CHOICES.kick, BET_CHOICES.noKick],
    [BET_CHOICES.move, BET_CHOICES.noMove],
    [BET_CHOICES.release, BET_CHOICES.noRelease],
    [BET_CHOICES.goStable, BET_CHOICES.noStable],
  ],
  botSettings: {
    ratio: { mainOpts: 60, subOpts: 40 },
    mainOpts: [
      BET_CHOICES.kick,
      BET_CHOICES.noKick,
      BET_CHOICES.move,
      BET_CHOICES.noMove,
      BET_CHOICES.release,
      BET_CHOICES.noRelease,
      BET_CHOICES.goStable,
      BET_CHOICES.noStable,
    ],
    subOpts: [
      BET_CHOICES.big,
      BET_CHOICES.small,
      BET_CHOICES.odd,
      BET_CHOICES.even,
    ],
  },
};
