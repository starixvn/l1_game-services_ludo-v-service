import mongoose from "mongoose";
import { GameConfigSchema } from "../models/game-config";
import gameSetting from "./game-settings";

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

export const createRoundData = (uid) => {
  return [
    {
      id: 2,
      uid: "otheruser",
      name: "OtherUser",
      amount: 100,
      totalAmount: 100,
      betWin: 195,
      reachMaxWin: false,
      odds: gameConfig.odds,
      currency: "$US",
      rate: 1,
      siteId: "111",
      playerId: 2,
      operatorId: "dummy-operator-id",
      paid: true,
      appType: 1,
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
      uid: uid,
      name: "NormalUser",
      amount: 100,
      totalAmount: 100,
      betWin: 195,
      reachMaxWin: false,
      odds: gameConfig.odds,
      currency: "$US",
      rate: 1,
      siteId: "111",
      playerId: 1,
      operatorId: "dummy-operator-id",
      paid: true,
      appType: 1,
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
