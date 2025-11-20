import { Core } from "sc-game-base";
import appConfigs from "./app-configs.js";
import ContainerRegistry from "./container-registry.js";
import GameData from "./game-data.js";
import GameDefinition from "./game-definition.js";
import gameSettings from "./game-settings.js";
import {
  generateOdds,
  generateResult,
  generateSettlementResult,
} from "./helpers/index.js";

const run = async () => {
  const definition = new GameDefinition(
    gameSettings,
    generateResult,
    generateSettlementResult,
    undefined,
    generateOdds,
  );

  const gameData = new GameData(gameSettings.durations.wholeRound);

  const app = new Core.BaseGameApp(gameSettings.name, appConfigs);
  const container = new ContainerRegistry().register(
    appConfigs,
    definition,
    gameData,
  );
  await app.run();
  await app.startGame(container);
};

run();
