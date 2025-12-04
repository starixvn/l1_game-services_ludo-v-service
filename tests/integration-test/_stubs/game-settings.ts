import gameSettings from "../../../src/game-settings.js";

export default {
  ...gameSettings,
  durations: {
    wholeRound: 15,
    placingBets: 10,
    lockingBet: 2,
  },
};
