import { Core } from "sc-game-base";

import appConfigs from "../../../src/app-configs.IGT.js";
import ContainerRegistry from "../../../src/container-registry.js";
import GameData from "../../../src/game-data.js";
import GameDefinition from "../../../src/game-definition.js";
import {
  generateOdds,
  generateResult,
  generateSettlementResult,
} from "../../../src/helpers/index.js";
import { initAllStubsWithMockData } from "../_stubs/apis/game-management-service-stub.js";
import gameSettings from "../_stubs/game-settings.js";

export const run = async () => {
  const definition = new GameDefinition(
    gameSettings,
    generateResult,
    generateSettlementResult,
    undefined,
    generateOdds,
  );

  // Initialize all stubs with mock data - no database required
  initAllStubsWithMockData(definition);

  const gameData = new GameData(gameSettings.durations.wholeRound);
  const container = new ContainerRegistry().register(
    appConfigs,
    definition,
    gameData,
  );
  const app = new Core.BaseGameApp("ludo", appConfigs);
  await app.run();
  await app.startGame(container);
};

await run();
