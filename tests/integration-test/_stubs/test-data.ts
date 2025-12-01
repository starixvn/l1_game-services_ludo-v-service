import mongoose from "mongoose";
import gameSetting from "../../../src/game-settings.js";
import { GameConfigSchema } from "../models/game-config";

export const game = {
  id: gameSetting.id,
  name: gameSetting.name,
};

export const currencyData = { code: "USD", name: "$US" };

export const socketOptionsFunc = (port) => ({
  socketUri: `http://localhost:${port}/user/${gameSetting.name.toLowerCase()}`,
  gameName: game.name,
  proxyRoute: "/socket.io",
});

export const gameConfig = {
  type: 0,
  name: gameSetting.name.toLowerCase(),
  minBet: 1,
  maxBet: 3000,
  maxBetPerChoices: {},
  botenabled: false,
  choices_maxbet: {},
  maxWinPerRound: 100000,
  odds: {
    margin: 0.05,
  },
};

export const createGameConfig = async () => {
  const defaultGameConfig = {
    enabled: true,
    minbet: 1,
    maxbet: 3000,
    disabledround: 1,
    botenabled: false,
    maxbot: 0,
    bot_maxbet: 1000000,
    maxWinPerRound: 100000,
    bot_minbet: 1,
    hour_maxbot: [
      0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01,
      0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01,
    ],
    disabled_message:
      "This game is under maintenance, it will be back shortly to upgrade new version.",
    delayStartTime: 0,
  };

  const mergedGameConfig = { ...defaultGameConfig, ...gameConfig };
  delete mongoose.models["game_configs"];
  const gameConfigModel = mongoose.model("game_configs", GameConfigSchema);
  return gameConfigModel.findOneAndUpdate(
    { name: mergedGameConfig.name },
    mergedGameConfig,
    {
      new: true,
      upsert: true,
    },
  );
};

// Full odds used in round data (matching what tests expect)
const roundOdds = {
  big: 1.95,
  small: 1.95,
  odd: 1.95,
  even: 1.95,
  kick: 3.5,
  noKick: 1.25,
  move: 1.95,
  noMove: 1.95,
  release: 3.5,
  noRelease: 1.25,
  goStable: 3.5,
  noStable: 1.25,
};

export const createRoundData = (uid) => {
  return [
    {
      id: 2,
      time: new Date(),
      result: {
        board: {
          "0": [8, 0, 0, 0],
          "1": [0, 0, 0, 0],
          "2": [45, 0, 0, 0],
          "3": [9, 7, 43, 0],
        },
        nextTurnIndex: 0,
        currentPlayers: [0, 1, 2, 3],
        winners: [],
        action: {
          oldPosition: 53,
          newPosition: 7,
          playerColor: 3,
        },
        dice: [6, 4],
      },
      settlementResult: {
        big: true,
        small: false,
        odd: false,
        even: true,
        kick: false,
        move: true,
        release: false,
        goStable: false,
      },
      exchangeRateId: 2089,
    },
    {
      id: 1,
      time: new Date(),
      result: {
        board: {
          "0": [8, 0, 0, 0],
          "1": [0, 0, 0, 0],
          "2": [45, 0, 0, 0],
          "3": [9, 53, 43, 0],
        },
        nextTurnIndex: 3,
        currentPlayers: [0, 1, 2, 3],
        winners: [],
        action: {
          oldPosition: 0,
          newPosition: 43,
          playerColor: 3,
        },
        dice: [2, 2],
      },
      settlementResult: {
        big: true,
        small: false,
        odd: false,
        even: true,
        kick: false,
        move: true,
        release: false,
        goStable: false,
      },
      exchangeRateId: 2089,
    },
  ];
};

export const createBetData = (uid: string) => {
  return [
    {
      roundId: 1,
      uid: uid,
      __v: 0,
      currency: "INH",
      freeBet: false,
      kick: 10,
      margin: 0.05,
      maxWin: 0,
      name: "Test User",
      odds: roundOdds,
      operatorId: "1234",
      paid: true,
      playerId: "1234567890",
      rate: 1,
      reachMaxWin: false,
      siteId: "4433",
      time: new Date(),
      totalAmount: 10,
      betwin: 10,
    },
  ];
};

export const createBetLogData = (uid: string) => {
  return [
    {
      uid: uid,
      name: "Test User",
      time: new Date(),
      choice: "noKick",
      amount: 10,
      roundId: 1,
      receivedTime: new Date(),
      currency: "INH",
      odds: roundOdds,
      operatorId: "1234",
      rate: 1,
      playerId: "1234567890",
    },
  ];
};
