import { describe, expect } from "@jest/globals";
import {
  GameClientDriver,
  eventTypes,
  normalUser,
} from "sc-game-service-integration-utils";
import appConfigs from "../../../src/app-configs.IGT.js";
import { socketOptionsFunc } from "../_stubs/test-data.js";
import { initUserSession } from "../helper/helper.js";

const socketOptions = socketOptionsFunc(appConfigs.hostingPort);

describe("place bet and settle", () => {
  let client;

  beforeAll(async () => {
    client = new GameClientDriver(socketOptions, initUserSession(normalUser));

    const sendSignInInterval = setInterval(() => {
      client.sendSignInEvent();
    }, 500);

    await client.handleSignedInEvent();

    client.sendInGameEvent();
    clearInterval(sendSignInInterval);
    await client.handleGameEvent((inGameData) => inGameData.gameConfigs);
  });

  afterAll(() => {
    client.close();
    client = null;
  });

  describe("when place bet with valid data", () => {
    const validChoices = [
      "big",
      "small",
      "odd",
      "even",
      "kick",
      "noKick",
      "move",
      "noMove",
      "release",
      "noRelease",
      "goStable",
      "noStable",
    ];

    validChoices.forEach((choice) => {
      it(`should receive end bet for ${choice}`, async () => {
        // Arrange
        const payload = {
          amount: 100,
          betChoice: choice,
          clientSeed: "1234",
        };

        // Act
        client.emit(eventTypes.bet, payload);

        // Assert
        const { endBet } = await client.handleGameEvent((data) => data.endBet);
        expect(endBet).toEqual(100);
      });
    });

    it("should receive own bets", async () => {
      // Arrange
      const payload = { amount: 100, betChoice: "big", clientSeed: "1234" };

      // Act
      client.emit(eventTypes.bet, payload);

      // Assert
      const { ownBets } = await client.handleGameEvent((data) => data.ownBets);
      expect(ownBets).toHaveProperty("big");
      expect(ownBets.big).toEqual(100);
    });

    it("should receive finish with correct structure", async () => {
      // Arrange
      const payload = { amount: 100, betChoice: "big", clientSeed: "1234" };

      // Act
      client.emit(eventTypes.bet, payload);

      // Assert
      const { finish } = await client.handleGameEvent((data) => data.finish);
      expect(finish).toHaveProperty("roundId");
      expect(finish).toHaveProperty("result");
      expect(finish).toHaveProperty("settlementResult");
      expect(finish).toHaveProperty("winAmount");
      expect(finish).toHaveProperty("amount");
      expect(finish).toHaveProperty("reachMaxWin");
      expect(finish).toHaveProperty("time");
      expect(finish.roundId).toBeGreaterThanOrEqual(1);

      // Check result structure
      expect(finish.result).toHaveProperty("dice");
      expect(Array.isArray(finish.result.dice)).toBe(true);
      expect(finish.result.dice.length).toBe(2);
      expect(finish.result.dice[0]).toBeGreaterThanOrEqual(1);
      expect(finish.result.dice[0]).toBeLessThanOrEqual(6);
      expect(finish.result.dice[1]).toBeGreaterThanOrEqual(1);
      expect(finish.result.dice[1]).toBeLessThanOrEqual(6);

      // Check settlement result structure
      expect(finish.settlementResult).toHaveProperty("big");
      expect(finish.settlementResult).toHaveProperty("small");
      expect(finish.settlementResult).toHaveProperty("odd");
      expect(finish.settlementResult).toHaveProperty("even");
      expect(finish.settlementResult).toHaveProperty("kick");
      expect(finish.settlementResult).toHaveProperty("move");
      expect(finish.settlementResult).toHaveProperty("release");
      expect(finish.settlementResult).toHaveProperty("goStable");

      expect(typeof finish.settlementResult.big).toBe("boolean");
      expect(typeof finish.settlementResult.small).toBe("boolean");
      expect(typeof finish.settlementResult.odd).toBe("boolean");
      expect(typeof finish.settlementResult.even).toBe("boolean");

      expect(finish.winAmount).toBeGreaterThanOrEqual(0);
      expect(finish.amount).toBeGreaterThanOrEqual(0);
      expect(typeof finish.reachMaxWin).toBe("boolean");
    });

    it("should receive playerBet", async () => {
      // Arrange
      const payload = { amount: 100, betChoice: "big", clientSeed: "1234" };

      // Act
      client.emit(eventTypes.bet, payload);

      // Assert
      const { playerBet } = await client.handleGameEvent(
        (data) => data.playerBet,
      );
      expect(playerBet.name).toEqual("N***ser"); // mask name NormalUser
      expect(playerBet.betAmount).toEqual(100);
      expect(playerBet.winAmount).toBeGreaterThanOrEqual(0);
    });

    it("should receive pf after finish", async () => {
      // Arrange
      const payload = { amount: 100, betChoice: "big", clientSeed: "1234" };

      // Act
      client.emit(eventTypes.bet, payload);
      await client.handleGameEvent((data) => data.finish);

      // Assert
      const { pf } = await client.handleGameEvent((data) => data.pf);
      expect(pf.serverSeedHash).toBeDefined();
      expect(typeof pf.serverSeedHash).toBe("string");
    });
  });

  describe("when place bet with invalid data", () => {
    const testCases = [
      {
        payload: { amount: 100, clientSeed: "1234" },
        expected: { errorCode: "SB1935" },
      },
      {
        payload: { betChoice: "big", clientSeed: "1234" },
        expected: { errorCode: "SB1935" },
      },
      {
        payload: { amount: 100, betChoice: "big" },
        expected: { errorCode: "SB1935" },
      },
      {
        payload: {
          amount: 100,
          betChoice: "invalidChoice",
          clientSeed: "1234",
        },
        expected: { errorCode: "SB1935" },
      },
      {
        payload: { amount: -100, betChoice: "big", clientSeed: "1234" },
        expected: { errorCode: "SB1935" },
      },
      {
        payload: { amount: 0, betChoice: "big", clientSeed: "1234" },
        expected: { errorCode: "SB1935" },
      },
    ];

    testCases.forEach(({ payload, expected }) => {
      it(`should receive error notice for payload: ${JSON.stringify(
        payload,
      )}`, async () => {
        // Act
        client.emit(eventTypes.bet, payload);

        // Assert
        const { endBet, notice } = await client.handleGameEvent(
          (data) => data.notice,
        );
        expect(endBet).toEqual(-1);
        expect(notice).toEqual(expected);
      });
    });
  });

  describe("hedge bet validation", () => {
    const hedgeBetPairs = [
      ["big", "small"],
      ["odd", "even"],
      ["kick", "noKick"],
      ["move", "noMove"],
      ["release", "noRelease"],
      ["goStable", "noStable"],
    ];

    hedgeBetPairs.forEach(([choice1, choice2]) => {
      it(`should not allow betting on both ${choice1} and ${choice2}`, async () => {
        // First bet
        client.emit(eventTypes.bet, {
          amount: 100,
          betChoice: choice1,
          clientSeed: "1234",
        });
        await client.handleGameEvent((data) => data.endBet);

        // Second bet on hedge
        client.emit(eventTypes.bet, {
          amount: 100,
          betChoice: choice2,
          clientSeed: "1234",
        });

        // Assert
        const { endBet, notice } = await client.handleGameEvent(
          (data) => data.notice,
        );
        expect(endBet).toEqual(-1);
        expect(notice.errorCode).toBeDefined();
      });
    });
  });
});
