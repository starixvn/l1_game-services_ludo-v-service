import {
  GameClientDriver,
  normalUser,
} from "sc-game-service-integration-utils";
import appConfigs from "../../../src/app-configs.IGT.js";
import { socketOptionsFunc } from "../_stubs/test-data.js";
import { initUserSession } from "../helper/helper.js";

const socketOptions = socketOptionsFunc(appConfigs.hostingPort);

describe("when get history", () => {
  let driver;

  beforeAll(async () => {
    driver = new GameClientDriver(socketOptions, initUserSession(normalUser));

    const sendSignInInterval = setInterval(() => {
      driver.sendSignInEvent();
    }, 500);

    await driver.handleSignedInEvent();

    driver.sendInGameEvent();
    await driver.handleGameEvent((inGameData) => inGameData.gameConfigs);

    clearInterval(sendSignInInterval);
  });

  afterAll(() => {
    driver.close();
  });

  it("should receive seeded history with exact values", async () => {
    // Arrange
    driver.sendGetHistoryEvent();

    // Act
    const { history } = await driver.handleGameEvent(
      (historyData) => historyData.history,
    );

    // Assert
    const seededRoundBetLogs = history.betLogs.filter(
      (betLog) => betLog.id === 1 && betLog.name === "NormalUser",
    );
    expect(seededRoundBetLogs.length).toBeGreaterThanOrEqual(1);

    const actualBetLogs = seededRoundBetLogs.slice(0, 1).map((betLog) => {
      const { result, time, totalAmount, ...rest } = betLog;
      return rest;
    });

    const expectedData = [
      {
        id: 1,
        amount: 100,
        betWin: 195,
        reachMaxWin: false,
        name: "NormalUser",
        odds: {
          big: 1.95,
          small: 1.95,
          odd: 1.95,
          even: 1.95,
          kick: 3.5,
          noKick: 1.25,
          move: 1.95,
          noMove: 1.95,
          release: 3.5,
          noRelease: 1.25,
          goStable: 3.5,
          noStable: 1.25,
        },
        clientSeed: "1234",
        settlementResult: {
          big: true,
          small: false,
          odd: false,
          even: true,
          kick: false,
          move: true,
          release: false,
          goStable: false,
        },
      },
    ];

    expect(actualBetLogs).toEqual(expectedData);
  }, 30000);

  it("should have correct result structure", async () => {
    // Arrange
    driver.sendGetHistoryEvent();

    // Act
    const { history } = await driver.handleGameEvent(
      (historyData) => historyData.history,
    );

    // Assert
    expect(history).toHaveProperty("betLogs");
    expect(Array.isArray(history.betLogs)).toBe(true);

    if (history.betLogs.length > 0) {
      const betLog = history.betLogs[0];
      expect(betLog).toHaveProperty("id");
      expect(betLog).toHaveProperty("amount");
      expect(betLog).toHaveProperty("betWin");
      expect(betLog).toHaveProperty("result");
      expect(betLog.result).toHaveProperty("dice");
      expect(betLog.result).toHaveProperty("action");
      expect(Array.isArray(betLog.result.dice)).toBe(true);
      expect(betLog.result.dice.length).toBe(2);
    }
  }, 30000);
});
