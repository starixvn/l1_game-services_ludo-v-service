import mongoose from "mongoose";
import { middlewares } from "sc-common";

import appConfigs from "../../../src/app-configs.IGT.js";
import { BetLogs, Bets, Rounds } from "../../../src/models/index.js";
import {
  createBetData,
  createBetLogData,
  createRoundData,
} from "./test-data.js";

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

  // Only seed rounds data for history tests
  // All other data (game configs, users, currencies, etc.) are mocked via nock
  await createGameData();

  console.log("Created round data for testing successfully!");
  process.exit(0);
};

const createGameData = async () => {
  // Use a static user ID since we're mocking user service
  const uid = "user-1"; // Matches the mock user ID in game-management-service-stub.ts
  await Rounds.insertMany(createRoundData(uid));
  await Bets.insertMany(createBetData(uid));
  await BetLogs.insertMany(createBetLogData(uid));
};

createTestData();
