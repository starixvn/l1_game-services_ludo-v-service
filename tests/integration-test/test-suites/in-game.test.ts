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
    const sendSignInInterval = setInterval(() => {
      client.sendSignInEvent();
    }, 500);

    await client.handleSignedInEvent();
    clearInterval(sendSignInInterval);
  });

  afterEach(() => {
    client.close();
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
    expect(gameConfigs.gameId).toBe(163);
    expect(gameConfigs.odds).toHaveProperty("big");
    expect(gameConfigs.odds).toHaveProperty("small");
    expect(gameConfigs.odds).toHaveProperty("odd");
    expect(gameConfigs.odds).toHaveProperty("even");
    expect(gameConfigs.odds).toHaveProperty("kick");
    expect(gameConfigs.odds).toHaveProperty("noKick");
    expect(gameConfigs.odds).toHaveProperty("move");
    expect(gameConfigs.odds).toHaveProperty("noMove");
    expect(gameConfigs.odds).toHaveProperty("release");
    expect(gameConfigs.odds).toHaveProperty("noRelease");
    expect(gameConfigs.odds).toHaveProperty("goStable");
    expect(gameConfigs.odds).toHaveProperty("noStable");
    expect(typeof gameConfigs.odds.big).toBe("number");
    expect(typeof gameConfigs.odds.small).toBe("number");
  });

  it("should receive user info", async () => {
    // Arrange
    client.sendInGameEvent();

    // Act
    const { user } = await client.handleGameEvent((data) => data.user);

    // Assert
    expect(user.name).toBe(normalUser.playerName);
    expect(user.rate).toBe(1);
  });

  it("should receive round history", async () => {
    // Arrange
    client.sendInGameEvent();

    // Act
    const { roundHistory } = await client.handleGameEvent(
      (data) => data.roundHistory,
    );

    // Assert
    expect(roundHistory.length).toBe(1);
    expect(roundHistory[0].id).toBe(1);
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
    expect(gameState.board).toHaveProperty("red");
    expect(gameState.board).toHaveProperty("green");
    expect(gameState.board).toHaveProperty("yellow");
    expect(gameState.board).toHaveProperty("blue");
    expect(Array.isArray(gameState.possibleActions)).toBe(true);
  });
});
