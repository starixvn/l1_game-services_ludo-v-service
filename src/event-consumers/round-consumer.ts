import { PlayerColor } from "@rd/ludo-rules";
import mongoose from "mongoose";
import GameManagementApiClientFactory, {
  getOrDefault,
} from "sc-game-base/dist/core/game-management-api/index.js";
import { gameManagementClient } from "sc-game-management-client";
import GameData from "../game-data.js";
import GameDefinition from "../game-definition.js";
import { IRound } from "../models/interfaces/round.js";

export class RoundConsumer {
  roundsRepository: mongoose.Model<IRound>;
  gameData: GameData;
  definition: GameDefinition;
  gameManagementApiClient: gameManagementClient;
  constructor(
    roundsRepository: mongoose.Model<IRound>,
    gameData: GameData,
    definition: GameDefinition,
    gameManagementApiClientFactory: GameManagementApiClientFactory,
  ) {
    this.roundsRepository = roundsRepository;
    this.gameData = gameData;
    this.definition = definition;
    this.gameManagementApiClient = gameManagementApiClientFactory.instance();
  }

  async initNewRound() {
    const lastRound = await this.roundsRepository
      .findOne({}, "id", { sort: { id: -1 } })
      .lean()
      .exec();

    if (lastRound) {
      this.gameData.roundId = lastRound.id + 1;
      this.gameData.currentBoardState = lastRound.result.boardState;
    } else {
      this.gameData.roundId = await this.getLastArchiveRound();
      this.gameData.currentBoardState = {
        raceMap: {},
        stableMap: {} as Record<PlayerColor, number[]>,
        startingAreaMap: {} as Record<PlayerColor, number>,
      };
    }
  }

  async getLastArchiveRound() {
    const { configName } = this.definition;
    const archiveStatus = await getOrDefault(
      this.gameManagementApiClient.archiveStatus.getArchiveStatus(configName),
      {},
    );

    return archiveStatus
      ? (archiveStatus.lastArcId["_phiens"] ??
          archiveStatus.lastArcId["_rounds"]) + 1
      : 1;
  }
}
