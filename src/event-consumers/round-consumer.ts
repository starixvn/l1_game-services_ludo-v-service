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
  constructor({
    roundsRepository,
    gameData,
    definition,
    gameManagementApiClientFactory,
  }: {
    roundsRepository: mongoose.Model<IRound>;
    gameData: GameData;
    definition: GameDefinition;
    gameManagementApiClientFactory: GameManagementApiClientFactory;
  }) {
    this.roundsRepository = roundsRepository;
    this.gameData = gameData;
    this.definition = definition;
    this.gameManagementApiClient = gameManagementApiClientFactory.instance();
  }

  async initNewRound() {
    const lastRound = await this.roundsRepository
      .findOne(
        {},
        { id: 1, result: 1, currentTurn: 1, initRoundId: 1 },
        { sort: { id: -1 } },
      )
      .lean()
      .exec();

    if (lastRound) {
      this.gameData.roundId = lastRound.id + 1;
      this.gameData.result = lastRound.result;
      this.gameData.initRoundId =
        lastRound.result.winners.length > 0
          ? this.gameData.roundId
          : lastRound.initRoundId;
    } else {
      this.gameData.roundId = await this.getLastArchiveRound();
      this.gameData.result.board = {
        [PlayerColor.RED]: [0, 0, 0, 0],
        [PlayerColor.GREEN]: [0, 0, 0, 0],
        [PlayerColor.YELLOW]: [0, 0, 0, 0],
        [PlayerColor.BLUE]: [0, 0, 0, 0],
      };
      this.gameData.result.currentPlayers = [
        PlayerColor.RED,
        PlayerColor.GREEN,
        PlayerColor.YELLOW,
        PlayerColor.BLUE,
      ];
      this.gameData.result.nextTurnIndex = 0;
      this.gameData.initRoundId = this.gameData.roundId;
    }
  }

  async getLastArchiveRound() {
    const { configName } = this.definition;
    const archiveStatus = await getOrDefault(
      this.gameManagementApiClient.archiveStatus.getArchiveStatus(configName),
      undefined,
    );

    return archiveStatus
      ? (archiveStatus.lastArcId["_phiens"] ??
          archiveStatus.lastArcId["_rounds"]) + 1
      : 1;
  }
}
