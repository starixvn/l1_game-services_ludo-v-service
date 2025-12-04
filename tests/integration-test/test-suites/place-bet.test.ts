import { describe, expect } from "@jest/globals";
import {
  GameClientDriver,
  eventTypes,
  normalUser,
} from "sc-game-service-integration-utils";
import appConfigs from "../../../src/app-configs.IGT.js";
import gameSettings from "../_stubs/game-settings.js";
import { socketOptionsFunc } from "../_stubs/test-data.js";
import {
  getTimeOutToPlacingBetTime,
  initUserSession,
} from "../helper/helper.js";

const socketOptions = socketOptionsFunc(appConfigs.hostingPort);

describe("place bet", () => {
  let client;
  let inGameData;

  beforeAll(async () => {
    client = new GameClientDriver(socketOptions, initUserSession(normalUser));

    await client.handleSignedInEvent();
    client.sendInGameEvent();
    inGameData = await client.handleGameEvent((data) => data.remainingTime);
  });

  afterAll(() => {
    client.close();
    client = null;
  });

  describe("when place bet with valid data", () => {
    it("should receive end bet", async () => {
      // Arrange
      const timeout =
        getTimeOutToPlacingBetTime(
          inGameData.remainingTime,
          gameSettings.durations,
        ) * 1000;
      const payload = { amount: 10, betChoice: "big" };

      // Act
      setTimeout(() => {
        client.emit(eventTypes.bet, payload);
      }, timeout);

      // Assert
      const { endBet } = await client.handleGameEvent((data) => data.endBet);
      expect(endBet).toEqual(10);
    });

    it("should receive own bets", async () => {
      // Arrange
      const timeout =
        getTimeOutToPlacingBetTime(
          inGameData.remainingTime,
          gameSettings.durations,
        ) * 1000;
      const payload = { amount: 10, betChoice: "odd" };

      // Act
      setTimeout(() => {
        client.emit(eventTypes.bet, payload);
      }, timeout);

      // Assert
      const { ownBets } = await client.handleGameEvent((data) => data.ownBets);
      expect(ownBets).toHaveProperty("big");
      expect(ownBets.odd).toEqual(10);
    });
  });

  describe("when place bet with invalid data", () => {
    it.each([
      {
        payload: { amount: 100 },
        expected: { errorCode: "SB1935" },
      },
      {
        payload: { betChoice: "big" },
        expected: { errorCode: "SB1935" },
      },
      {
        payload: {
          amount: 100,
          betChoice: "invalidChoice",
        },
        expected: { errorCode: "SB1935" },
      },
      {
        payload: { amount: -100, betChoice: "big" },
        expected: { errorCode: "SB1935" },
      },
      {
        payload: { amount: 0, betChoice: "big" },
        expected: { errorCode: "SB1935" },
      },
    ])(
      "should receive error notice for payload: $payload",
      async ({ payload, expected }) => {
        // Arrange - create a dedicated client for this test case
        const testClient = new GameClientDriver(
          socketOptions,
          initUserSession(normalUser),
        );
        await testClient.handleSignedInEvent();
        testClient.sendInGameEvent();
        await testClient.handleGameEvent((data) => data.remainingTime);

        try {
          const timeout =
            getTimeOutToPlacingBetTime(
              inGameData.remainingTime,
              gameSettings.durations,
            ) * 1000;

          // Act
          setTimeout(() => {
            testClient.emit(eventTypes.bet, payload);
          }, timeout);

          // Assert
          const { endBet, notice } = await testClient.handleGameEvent(
            (data) => data.notice,
          );
          expect(endBet).toEqual(-1);
          expect(notice).toEqual(expected);
        } finally {
          testClient.close();
        }
      },
    );
  });

  describe("hedge bet validation", () => {
    it.each([
      ["big", "small"],
      ["odd", "even"],
      ["kick", "noKick"],
      ["move", "noMove"],
      ["release", "noRelease"],
      ["goStable", "noStable"],
    ])(
      "should not allow betting on both %s and %s",
      async (choice1, choice2) => {
        // Arrange - create a dedicated client for this test case
        const testClient = new GameClientDriver(
          socketOptions,
          initUserSession(normalUser),
        );
        await testClient.handleSignedInEvent();
        testClient.sendInGameEvent();
        await testClient.handleGameEvent((data) => data.remainingTime);

        try {
          const timeout =
            getTimeOutToPlacingBetTime(
              inGameData.remainingTime,
              gameSettings.durations,
            ) * 1000;

          // First bet
          setTimeout(() => {
            testClient.emit(eventTypes.bet, {
              amount: 100,
              betChoice: choice1,
              clientSeed: "1234",
            });
          }, timeout);
          await testClient.handleGameEvent((data) => data.endBet);

          // Second bet on hedge
          testClient.emit(eventTypes.bet, {
            amount: 100,
            betChoice: choice2,
            clientSeed: "1234",
          });

          // Assert
          const { endBet, notice } = await testClient.handleGameEvent(
            (data) => data.notice,
          );
          expect(endBet).toEqual(-1);
          expect(notice.errorCode).toBeDefined();
        } finally {
          testClient.close();
        }
      },
    );
  });
});
