import { Core } from "sc-game-base";
import {
  initAPIStub,
  stubUserService,
  subGameManagementService,
} from "sc-game-service-integration-utils";

import {
  endGameErrorUser,
  errorUser,
  internalServerErrorUser,
  normalUser,
} from "sc-game-service-integration-utils/src/stubs/user-stub";
import appConfigs from "../../../src/app-configs.IGT.js";
import ContainerRegistry from "../../../src/container-registry.js";
import GameData from "../../../src/game-data.js";
import GameDefinition from "../../../src/game-definition.js";
import gameSettings from "../../../src/game-settings.js";
import {
  generateOdds,
  generateResult,
  generateSettlementResult,
} from "../../../src/helpers/index.js";
import { stubUserInfo } from "../_stubs/apis/game-management.js";
import {
  stubDomain,
  stubGameNotifications,
  stubPromotionService,
  stubUserTrackingApi,
} from "../_stubs/apis/index.js";

export const run = async () => {
  initAPIStub(appConfigs.apiSettings.apiUrl);
  stubUserService(appConfigs, [
    endGameErrorUser,
    errorUser,
    internalServerErrorUser,
    normalUser,
  ] as any);
  stubGameNotifications();
  stubUserTrackingApi();
  stubDomain();
  stubPromotionService(120);
  const userInfos = [
    endGameErrorUser,
    errorUser,
    internalServerErrorUser,
    normalUser,
  ] as any;
  userInfos.map((userInfo) => stubUserInfo(userInfo, appConfigs));
  const definition = new GameDefinition(
    gameSettings,
    generateResult,
    generateSettlementResult,
    undefined,
    generateOdds,
  );
  subGameManagementService(appConfigs, definition);

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
