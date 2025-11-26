import {
  GameClientDriver,
  normalUser,
} from "sc-game-service-integration-utils";
import appConfigs from "../../../src/app-configs.IGT.js";
import { socketOptionsFunc } from "../_stubs/test-data.js";
import { initUserSession } from "../helper/helper";

const socketOptions = socketOptionsFunc(appConfigs.hostingPort);

describe("in game", () => {
  let client;

  beforeEach(async () => {
    client = new GameClientDriver(socketOptions, initUserSession(normalUser));
    await client.handleSignedInEvent();
  });

  afterEach(async () => {
    await client.close();
    client = null;
  });

  it("should receive game configs response", async () => {
    // Arrange
    client.sendInGameEvent();

    // Act
    const { gameConfigs } = await client.handleGameEvent(
      (data) => data.gameConfigs,
    );

    // Assert
    expect(gameConfigs).toBeDefined();
  });

  it("should receive user info", async () => {
    // Arrange
    client.sendInGameEvent();

    // Act
    const { user } = await client.handleGameEvent((data) => data.user);

    // Assert
    expect(user.name).toBe(normalUser.playerName);
  });

  it("should receive round history", async () => {
    // Arrange
    client.sendInGameEvent();

    // Act
    const { roundHistory } = await client.handleGameEvent(
      (data) => data.roundHistory,
    );

    // Assert
    expect(roundHistory[0].result).toHaveProperty("dice1");
    expect(roundHistory[0].result).toHaveProperty("dice2");
    expect(roundHistory[0].result.dice1).toBeGreaterThanOrEqual(1);
    expect(roundHistory[0].result.dice1).toBeLessThanOrEqual(6);
    expect(roundHistory[0].result.dice2).toBeGreaterThanOrEqual(1);
    expect(roundHistory[0].result.dice2).toBeLessThanOrEqual(6);
  });

  it("should receive game state", async () => {
    // Arrange
    client.sendInGameEvent();

    // Act
    const { gameState } = await client.handleGameEvent(
      (data) => data.gameState,
    );

    // Assert
    expect(gameState).toHaveProperty("board");
    expect(gameState).toHaveProperty("currentTurnCount");
    expect(gameState).toHaveProperty("nextPlayer");
    expect(gameState).toHaveProperty("possibleActions");
    expect(gameState.board).toHaveProperty("0");
    expect(gameState.board).toHaveProperty("1");
    expect(gameState.board).toHaveProperty("2");
    expect(gameState.board).toHaveProperty("3");
    expect(Array.isArray(gameState.possibleActions)).toBe(true);
  });
});
