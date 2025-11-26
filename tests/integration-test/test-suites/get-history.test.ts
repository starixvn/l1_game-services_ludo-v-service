import {
  GameClientDriver,
  normalUser,
} from "sc-game-service-integration-utils";
import appConfigs from "../../../src/app-configs.IGT.js";
import { socketOptionsFunc } from "../_stubs/test-data.js";
import { initUserSession } from "../helper/helper.js";

const socketOptions = socketOptionsFunc(appConfigs.hostingPort);

describe("get history", () => {
  let driver;

  beforeAll(async () => {
    driver = new GameClientDriver(socketOptions, initUserSession(normalUser));

    await driver.handleSignedInEvent();
  });

  afterAll(async () => {
    await driver.close();
  });

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
      expect(betLog).toHaveProperty("totalAmount");
      expect(betLog).toHaveProperty("betwin");
      expect(betLog).toHaveProperty("result");
      expect(betLog).toHaveProperty("betLogDetails");
      expect(betLog.result).toHaveProperty("dice");
      expect(betLog.result).toHaveProperty("action");
      expect(Array.isArray(betLog.result.dice)).toBe(true);
      expect(betLog.result.dice.length).toBe(2);
    }
  }, 30000);
});
