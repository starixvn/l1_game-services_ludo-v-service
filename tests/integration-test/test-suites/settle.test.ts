import { describe, expect } from "@jest/globals";
import {
  GameClientDriver,
  eventTypes,
} from "sc-game-service-integration-utils";
import appConfigs from "../../../src/app-configs.IGT.js";
import gameSettings from "../_stubs/game-settings.js";
import {
  adminSocketOptionsFunc,
  socketOptionsFunc,
} from "../_stubs/test-data.js";
import { initUserSession } from "../helper/helper.js";
import { getTimeOutToPlacingBetTime } from "../helper/helper.js";
import {
  createMockUserSession,
  winnerUser,
} from "../_stubs/apis/game-management-service-stub.js";

const socketOptions = socketOptionsFunc(appConfigs.hostingPort);
const adminSocketOptions = adminSocketOptionsFunc(appConfigs.hostingPort);
describe("settle", () => {
  const winnerUserSession = initUserSession(winnerUser);
  const userSession = createMockUserSession(
    winnerUser.playerId,
    winnerUser.playerName,
  );
  let gameClientDriver: GameClientDriver;
  let adminClientDriver: GameClientDriver;
  let inGameData: { roundId: number; remainingTime: number };
  beforeEach(async () => {
    gameClientDriver = new GameClientDriver(socketOptions, winnerUserSession);
    adminClientDriver = new GameClientDriver(
      adminSocketOptions,
      winnerUserSession,
    );
    await gameClientDriver.handleSignedInEvent();
    gameClientDriver.sendInGameEvent();
    inGameData = await gameClientDriver.handleGameEvent((data) => data.roundId);
  });
  afterEach(async () => {
    await Promise.all([gameClientDriver.close(), adminClientDriver.close()]);
  });
  it("should receive winners response", async () => {
    // Arrange
    const timeout =
      getTimeOutToPlacingBetTime(
        inGameData?.remainingTime,
        gameSettings.durations,
      ) * 1000;

    setTimeout(() => {
      adminClientDriver.emit("message", {
        authentication: {
          jwt: "admin-jwt",
        },
        [gameSettings.name.toLowerCase()]: {
          set_result: {
            roundId: inGameData?.roundId,
            result: { dice: [1, 2] },
          },
        },
      });
      gameClientDriver.emit(eventTypes.bet, { amount: 22, betChoice: "small" });
    }, timeout);
    const { winners } = await gameClientDriver.handleGameEvent(
      (data) => data.winners?.winningPlayers?.[userSession.userId],
    );

    // Assert
    expect(
      winners.winningPlayers[userSession.userId].winningByChoices,
    ).toHaveProperty("small");
  });
});
