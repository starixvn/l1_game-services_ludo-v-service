import mongoose from "mongoose";
import { users } from "sc-base-database";
import { middlewares } from "sc-common";
import {
  createCurrencyGroupGames,
  createDummyCurrency,
  createDummyUsers,
  createExchangeRate,
  createPartnerConfig,
  normalUser,
} from "sc-game-service-integration-utils";

import appConfigs from "../../../src/app-configs.IGT.js";
import { Rounds } from "../../../src/models/index.js";
import {
  createGameConfig,
  createRoundData,
  currencyData,
  game,
  gameConfig,
} from "./test-data";

const connectDatabase = async () => {
  await middlewares.database.configureDatabase(mongoose, appConfigs.database);

  await clearAllData();
};

const clearAllData = async () => {
  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
};

export const createTestData = async () => {
  await connectDatabase();
  await createExchangeRate();
  await createGameConfig();
  const partnerConfig = await createPartnerConfig(game.id);

  const currency = await createDummyCurrency(
    partnerConfig.partnerId,
    currencyData.code,
    currencyData.name,
  );
  await createCurrencyGroupGames(currency.groupId, game.id, gameConfig);
  await createDummyUsers(currency);
  await createGameData();

  console.log(
    "Create exchange rate, game config & dummy user for testing successfully!",
  );
  process.exit(0);
};

const getUserId = async (playerId) => {
  const user = await users
    .findOne({ "local.playerId": playerId }, { _id: true })
    .lean();
  return user?._id?.toString();
};

const createGameData = async () => {
  const uid = await getUserId(normalUser.playerId);
  if (!uid) {
    return;
  }
  await Rounds.insertMany(createRoundData(uid));
};

createTestData();
