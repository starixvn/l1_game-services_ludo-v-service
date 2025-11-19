import { Core } from "sc-game-base";
import appConfigs from "./app-configs.js";
import ContainerRegistry from "./container-registry.js";
import GameData from "./game-data.js";
import GameDefinition from "./game-definition.js";
import gameSettings from "./game-settings.js";
import { resultHelper } from "./helpers/index.js";

const run = async () => {
  const definition = new GameDefinition(
    gameSettings as any,
    resultHelper.generateResult,
    resultHelper.getSettlementResult,
    resultHelper.generateRawResultForHash,
  );

  const gameData = new GameData(gameSettings.durations.wholeRound);

  const app = new Core.BaseGameApp(gameSettings.name, appConfigs);
  const container = new ContainerRegistry().register(
    appConfigs as any,
    definition as any,
    gameData as any,
  );
  await app.run();
  await app.startGame(container);
};

run();
