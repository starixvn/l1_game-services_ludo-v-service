import { convertBoardState, PlayerColor } from "@rd/ludo-rules";
import mongoose from "mongoose";
import { SettleGameRoundConsumer } from "../../../src/event-consumers/settle-game-round-consumer.js";
import GameData from "../../../src/game-data.js";
import { IBet } from "../../../src/models/interfaces/bet.js";
import { IResult } from "../../../src/models/interfaces/result.js";
import { IRound } from "../../../src/models/interfaces/round.js";
import { ISettlementResult } from "../../../src/models/interfaces/settlement-result.js";
import { generateMargins } from "../__mock__/margins.js";

// Mock sc-game-base to avoid constructor issues
jest.mock("sc-game-base", () => {
  const mockBaseClass = class MockTableSettleGameRoundConsumer {
    gameData: any;
    definition: any;
    roundsRepository: any;
    roundResultPublisher: any;
    betsRepository: any;
    settleBets: jest.Mock;
    generateResult: jest.Mock;

    constructor(params: any) {
      Object.assign(this, params);
      this.settleBets = jest.fn();
      this.generateResult = jest.fn();
    }
  };

  return {
    Table: {
      EventConsumers: {
        TableSettleGameRoundConsumer: mockBaseClass,
      },
      TableGameData: class MockTableGameData {
        remainingTime: number;
        roundId: number;
        initRoundId: number;
        totalBets: any;
        chips: any;
        result: any;
        winningPlayers: any[];
        constructor(remainingTime: number) {
          this.remainingTime = remainingTime;
          this.roundId = 0;
          this.initRoundId = 0;
          this.totalBets = {};
          this.chips = [];
          this.result = {};
          this.winningPlayers = [];
        }
      },
    },
  };
});

describe("SettleGameRoundConsumer", () => {
  describe("Class definition", () => {
    test("should be defined", () => {
      // Arrange & Act & Assert
      expect(SettleGameRoundConsumer).toBeDefined();
    });

    test("should extend from TableSettleGameRoundConsumer base class", () => {
      // Arrange
      const mockDeps = createMockDependencies();

      // Act
      const consumer = new SettleGameRoundConsumer(mockDeps);

      // Assert
      expect(consumer).toBeInstanceOf(SettleGameRoundConsumer);
      expect(consumer.settleRound).toBeDefined();
      expect(consumer.collectRoundResult).toBeDefined();
      expect(consumer.calculateBetResult).toBeDefined();
    });

    test("should have required methods", () => {
      // Arrange & Act
      const hasRequiredMethods =
        SettleGameRoundConsumer.prototype.settleRound !== undefined &&
        SettleGameRoundConsumer.prototype.collectRoundResult !== undefined &&
        SettleGameRoundConsumer.prototype.calculateBetResult !== undefined;

      // Assert
      expect(hasRequiredMethods).toBe(true);
      expect(SettleGameRoundConsumer.prototype.settleRound).toBeDefined();
      expect(
        SettleGameRoundConsumer.prototype.collectRoundResult,
      ).toBeDefined();
      expect(
        SettleGameRoundConsumer.prototype.calculateBetResult,
      ).toBeDefined();
    });
  });

  describe("Method signatures", () => {
    test("settleRound should be an async function", () => {
      // Arrange
      const method = SettleGameRoundConsumer.prototype.settleRound;

      // Act
      const isAsync = method.constructor.name === "AsyncFunction";

      // Assert
      expect(method).toBeDefined();
      expect(isAsync).toBe(true);
    });

    test("collectRoundResult should be a regular function", () => {
      // Arrange
      const method = SettleGameRoundConsumer.prototype.collectRoundResult;

      // Act
      const isAsync = method.constructor.name === "AsyncFunction";

      // Assert
      expect(method).toBeDefined();
      expect(isAsync).toBe(false);
    });

    test("calculateBetResult should be a regular function", () => {
      // Arrange
      const method = SettleGameRoundConsumer.prototype.calculateBetResult;

      // Act
      const isAsync = method.constructor.name === "AsyncFunction";

      // Assert
      expect(method).toBeDefined();
      expect(isAsync).toBe(false);
    });
  });

  describe("collectRoundResult", () => {
    test("should transform result with dice object", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const result: IResult = {
        board: {
          [PlayerColor.RED]: [0, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 0,
        currentPlayers: [PlayerColor.RED],
        winners: [],
        dice: [3, 5],
        action: {
          oldPosition: 0,
          newPosition: 7,
          playerColor: PlayerColor.RED,
        },
      };
      const settlementResult: ISettlementResult = {
        big: false,
        small: true,
        odd: true,
        even: false,
        kick: false,
        noKick: true,
        move: true,
        noMove: false,
        release: false,
        noRelease: true,
        goStable: false,
        noStable: true,
      };
      const roundId = 10;

      // Act
      const roundResult = consumer.collectRoundResult(
        result,
        settlementResult,
        roundId,
      );

      // Assert
      expect(roundResult).toBeDefined();
      expect(roundResult.result.dice1).toEqual(3);
      expect(roundResult.result.dice2).toEqual(5);
      expect(roundResult.roundId).toBe(10);
      expect(roundResult.settlementResult).toEqual(settlementResult);
    });

    test("should preserve all result properties except dice", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const result: IResult = {
        board: {
          [PlayerColor.RED]: [5, 10, 15, 20],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 1,
        currentPlayers: [PlayerColor.RED, PlayerColor.GREEN],
        winners: [PlayerColor.RED],
        dice: [6, 6],
        action: {
          oldPosition: 15,
          newPosition: 27,
          playerColor: PlayerColor.RED,
        },
      };
      const settlementResult: ISettlementResult = {
        big: true,
        small: false,
        odd: false,
        even: true,
        kick: false,
        noKick: true,
        move: true,
        noMove: false,
        release: false,
        noRelease: true,
        goStable: false,
        noStable: true,
      };
      const roundId = 25;

      // Act
      const roundResult = consumer.collectRoundResult(
        result,
        settlementResult,
        roundId,
      );

      // Assert
      expect(roundResult.result.board).toEqual(result.board);
      expect(roundResult.result.action).toEqual({
        ...result.action,
        player: result.action.playerColor,
        playerColor: undefined,
      });
    });

    test("should include nextPlayer when there are winners", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const result: IResult = {
        board: {
          [PlayerColor.RED]: [57, 57, 57, 57],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 2,
        currentPlayers: [PlayerColor.RED],
        winners: [PlayerColor.RED],
        dice: [6, 6],
        action: {
          oldPosition: 51,
          newPosition: 57,
          playerColor: PlayerColor.RED,
        },
      };
      const settlementResult: ISettlementResult = {
        big: true,
        small: false,
        odd: false,
        even: true,
        kick: false,
        noKick: true,
        move: true,
        noMove: false,
        release: false,
        noRelease: true,
        goStable: true,
        noStable: false,
      };
      const roundId = 100;

      // Act
      const roundResult = consumer.collectRoundResult(
        result,
        settlementResult,
        roundId,
      );

      // Assert
      expect(roundResult.result.nextPlayer).toBe(PlayerColor.YELLOW); // ALL_PLAYERS[2]
    });

    test("should not include nextPlayer when there are no winners", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const result: IResult = {
        board: {
          [PlayerColor.RED]: [10, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 1,
        currentPlayers: [PlayerColor.RED, PlayerColor.GREEN],
        winners: [],
        dice: [3, 4],
        action: {
          oldPosition: 0,
          newPosition: 7,
          playerColor: PlayerColor.RED,
        },
      };
      const settlementResult: ISettlementResult = {
        big: false,
        small: true,
        odd: true,
        even: false,
        kick: false,
        noKick: true,
        move: true,
        noMove: false,
        release: false,
        noRelease: true,
        goStable: false,
        noStable: true,
      };
      const roundId = 50;

      // Act
      const roundResult = consumer.collectRoundResult(
        result,
        settlementResult,
        roundId,
      );

      // Assert
      expect(roundResult.result.nextPlayer).toBeUndefined();
    });

    test("should handle different dice combinations", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const testCases = [
        { dice: [1, 1], expected: { dice1: 1, dice2: 1 } },
        { dice: [6, 1], expected: { dice1: 6, dice2: 1 } },
        { dice: [3, 4], expected: { dice1: 3, dice2: 4 } },
      ];

      testCases.forEach(({ dice, expected }) => {
        const result: IResult = {
          board: {
            [PlayerColor.RED]: [0, 0, 0, 0],
            [PlayerColor.GREEN]: [0, 0, 0, 0],
            [PlayerColor.YELLOW]: [0, 0, 0, 0],
            [PlayerColor.BLUE]: [0, 0, 0, 0],
          },
          nextTurnIndex: 0,
          currentPlayers: [PlayerColor.RED],
          winners: [],
          dice,
          action: {
            oldPosition: 0,
            newPosition: 0,
            playerColor: PlayerColor.RED,
          },
        };
        const settlementResult: ISettlementResult = {
          big: false,
          small: true,
          odd: false,
          even: true,
          kick: false,
          noKick: true,
          move: false,
          noMove: true,
          release: false,
          noRelease: true,
          goStable: false,
          noStable: true,
        };

        // Act
        const roundResult = consumer.collectRoundResult(
          result,
          settlementResult,
          1,
        );

        // Assert
        expect(roundResult.result.dice1).toEqual(dice[0]);
        expect(roundResult.result.dice2).toEqual(dice[1]);
      });
    });

    test("should filter out settlement result entries where odds are 0", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      // Set some odds to 0
      mockDeps.gameData.odds = {
        big: 1.5,
        small: 0, // This should be filtered out
        odd: 2.0,
        even: 0, // This should be filtered out
        kick: 0, // This should be filtered out
        noKick: 1.2,
        move: 1.5,
        noMove: 0, // This should be filtered out
        release: 4.0,
        noRelease: 1.1,
        goStable: 0, // This should be filtered out
        noStable: 1.05,
      };
      const result: IResult = {
        board: {
          [PlayerColor.RED]: [0, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 0,
        currentPlayers: [PlayerColor.RED],
        winners: [],
        dice: [3, 5],
        action: {
          oldPosition: 0,
          newPosition: 7,
          playerColor: PlayerColor.RED,
        },
      };
      const settlementResult: ISettlementResult = {
        big: false,
        small: true,
        odd: true,
        even: false,
        kick: false,
        noKick: true,
        move: true,
        noMove: false,
        release: false,
        noRelease: true,
        goStable: false,
        noStable: true,
      };
      const roundId = 10;

      // Act
      const roundResult = consumer.collectRoundResult(
        result,
        settlementResult,
        roundId,
      );

      // Assert
      expect(roundResult.settlementResult).toEqual({
        big: false,
        odd: true,
        noKick: true,
        move: true,
        release: false,
        noRelease: true,
        noStable: true,
      });
      // Verify filtered out entries are not present
      expect(roundResult.settlementResult.small).toBeUndefined();
      expect(roundResult.settlementResult.even).toBeUndefined();
      expect(roundResult.settlementResult.kick).toBeUndefined();
      expect(roundResult.settlementResult.noMove).toBeUndefined();
      expect(roundResult.settlementResult.goStable).toBeUndefined();
    });
  });

  describe("calculateBetResult", () => {
    test("should calculate bet result for single winning bet", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const settlementResult: ISettlementResult = {
        big: true,
        small: false,
        odd: false,
        even: false,
        kick: false,
        noKick: false,
        move: false,
        noMove: false,
        release: false,
        noRelease: false,
        goStable: false,
        noStable: false,
      };
      const bet: IBet = {
        uid: "user1",
        name: "TestUser",
        big: 100,
        totalAmount: 100,
        currency: "USD",
        rate: 1,
        betwin: 0,
        time: new Date(),
        odds: {},
        freeBet: false,
        roundId: 1,
        paid: false,
        playerId: "player1",
        siteId: "site1",
        operatorId: "op1",
        reachMaxWin: false,
        maxWin: 10000,
      };
      const odds = { big: 1.95 };

      // Act
      const betResult = consumer.calculateBetResult(
        settlementResult,
        bet,
        odds,
      );

      // Assert
      expect(betResult.totalBetAmount).toBe(100);
      expect(betResult.totalWin).toBe(195);
      expect(betResult.netWin).toBe(95);
      expect(betResult.totalLost).toBe(0);
      expect(betResult.winningByChoices.big).toBe(195);
    });

    test("should calculate bet result for single losing bet", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const settlementResult: ISettlementResult = {
        big: false,
        small: true,
        odd: false,
        even: false,
        kick: false,
        noKick: false,
        move: false,
        noMove: false,
        release: false,
        noRelease: false,
        goStable: false,
        noStable: false,
      };
      const bet: IBet = {
        uid: "user1",
        name: "TestUser",
        big: 100,
        totalAmount: 100,
        currency: "USD",
        rate: 1,
        betwin: 0,
        time: new Date(),
        odds: {},
        freeBet: false,
        roundId: 1,
        paid: false,
        playerId: "player1",
        siteId: "site1",
        operatorId: "op1",
        reachMaxWin: false,
        maxWin: 10000,
      };
      const odds = { big: 1.95, small: 2.35 };

      // Act
      const betResult = consumer.calculateBetResult(
        settlementResult,
        bet,
        odds,
      );

      // Assert
      expect(betResult.totalBetAmount).toBe(100);
      expect(betResult.totalWin).toBe(0);
      expect(betResult.netWin).toBe(0);
      expect(betResult.totalLost).toBe(100);
      expect(betResult.winningByChoices.big).toBe(0);
    });

    test("should calculate bet result for multiple bets with mixed outcomes", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const settlementResult: ISettlementResult = {
        big: true,
        small: false,
        odd: true,
        even: false,
        kick: false,
        noKick: true,
        move: true,
        noMove: false,
        release: false,
        noRelease: true,
        goStable: false,
        noStable: true,
      };
      const bet: IBet = {
        uid: "user1",
        name: "TestUser",
        big: 100,
        odd: 50,
        small: 75,
        move: 25,
        totalAmount: 250,
        currency: "USD",
        rate: 1,
        betwin: 0,
        time: new Date(),
        odds: {},
        freeBet: false,
        roundId: 1,
        paid: false,
        playerId: "player1",
        siteId: "site1",
        operatorId: "op1",
        reachMaxWin: false,
        maxWin: 10000,
      };
      const odds = {
        big: 1.95,
        odd: 1.95,
        small: 2.35,
        move: 1.5,
      };

      // Act
      const betResult = consumer.calculateBetResult(
        settlementResult,
        bet,
        odds,
      );

      // Assert
      expect(betResult.totalBetAmount).toBe(250);
      expect(betResult.totalWin).toBe(330);
      // netWin = (195-100) + (97.5-50) + (37.5-25) = 95 + 47.5 + 12.5 = 155
      expect(betResult.netWin).toBe(155);
      expect(betResult.totalLost).toBe(75);
      expect(betResult.winningByChoices.big).toBe(195);
      expect(betResult.winningByChoices.odd).toBe(97.5);
      expect(betResult.winningByChoices.small).toBe(0);
      expect(betResult.winningByChoices.move).toBe(37.5);
    });

    test("should handle freeBet by reducing odds by 1", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const settlementResult: ISettlementResult = {
        big: true,
        small: false,
        odd: false,
        even: false,
        kick: false,
        noKick: false,
        move: false,
        noMove: false,
        release: false,
        noRelease: false,
        goStable: false,
        noStable: false,
      };
      const bet: IBet = {
        uid: "user1",
        name: "TestUser",
        big: 100,
        totalAmount: 100,
        currency: "USD",
        rate: 1,
        betwin: 0,
        time: new Date(),
        odds: {},
        freeBet: true,
        roundId: 1,
        paid: false,
        playerId: "player1",
        siteId: "site1",
        operatorId: "op1",
        reachMaxWin: false,
        maxWin: 10000,
      };
      const odds = { big: 1.95 };

      // Act
      const betResult = consumer.calculateBetResult(
        settlementResult,
        bet,
        odds,
      );

      // Assert
      // effectiveOdds = 1.95 - 1 = 0.95
      // winAmount = 100 * 0.95 = 95
      expect(betResult.totalWin).toBe(95);
      expect(betResult.netWin).toBe(-5); // 95 - 100
      expect(betResult.winningByChoices.big).toBe(95);
    });

    test("should skip choices with zero bet amount", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const settlementResult: ISettlementResult = {
        big: true,
        small: false,
        odd: true,
        even: false,
        kick: false,
        noKick: false,
        move: false,
        noMove: false,
        release: false,
        noRelease: false,
        goStable: false,
        noStable: false,
      };
      const bet: IBet = {
        uid: "user1",
        name: "TestUser",
        big: 100,
        totalAmount: 100,
        currency: "USD",
        rate: 1,
        betwin: 0,
        time: new Date(),
        odds: {},
        freeBet: false,
        roundId: 1,
        paid: false,
        playerId: "player1",
        siteId: "site1",
        operatorId: "op1",
        reachMaxWin: false,
        maxWin: 10000,
      };
      const odds = { big: 1.95, odd: 1.95 };

      // Act
      const betResult = consumer.calculateBetResult(
        settlementResult,
        bet,
        odds,
      );

      // Assert
      expect(betResult.totalBetAmount).toBe(100);
      expect(betResult.winningByChoices.big).toBe(195);
      expect(betResult.winningByChoices.odd).toBeUndefined();
    });

    test("should use default odds of 1 when choice odds not found", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const settlementResult: ISettlementResult = {
        big: true,
        small: false,
        odd: false,
        even: false,
        kick: false,
        noKick: false,
        move: false,
        noMove: false,
        release: false,
        noRelease: false,
        goStable: false,
        noStable: false,
      };
      const bet: IBet = {
        uid: "user1",
        name: "TestUser",
        big: 100,
        totalAmount: 100,
        currency: "USD",
        rate: 1,
        betwin: 0,
        time: new Date(),
        odds: {},
        freeBet: false,
        roundId: 1,
        paid: false,
        playerId: "player1",
        siteId: "site1",
        operatorId: "op1",
        reachMaxWin: false,
        maxWin: 10000,
      };
      const odds = {}; // No odds provided

      // Act
      const betResult = consumer.calculateBetResult(
        settlementResult,
        bet,
        odds,
      );

      // Assert
      expect(betResult.totalWin).toBe(100); // 100 * 1 = 100
      expect(betResult.netWin).toBe(0); // 100 - 100 = 0
    });

    test("should round totalWin and netWin to 2 decimal places", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const settlementResult: ISettlementResult = {
        big: true,
        small: false,
        odd: true,
        even: false,
        kick: false,
        noKick: false,
        move: false,
        noMove: false,
        release: false,
        noRelease: false,
        goStable: false,
        noStable: false,
      };
      const bet: IBet = {
        uid: "user1",
        name: "TestUser",
        big: 33.33,
        odd: 66.67,
        totalAmount: 100,
        currency: "USD",
        rate: 1,
        betwin: 0,
        time: new Date(),
        odds: {},
        freeBet: false,
        roundId: 1,
        paid: false,
        playerId: "player1",
        siteId: "site1",
        operatorId: "op1",
        reachMaxWin: false,
        maxWin: 10000,
      };
      const odds = { big: 1.95, odd: 1.95 };

      // Act
      const betResult = consumer.calculateBetResult(
        settlementResult,
        bet,
        odds,
      );

      // Assert
      expect(betResult.totalWin).toBe(195);
      expect(betResult.netWin).toBe(95);
    });

    test("should handle all betting choices", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const settlementResult: ISettlementResult = {
        big: true,
        small: false,
        odd: true,
        even: false,
        kick: true,
        noKick: false,
        move: true,
        noMove: false,
        release: true,
        noRelease: false,
        goStable: true,
        noStable: false,
      };
      const bet: IBet = {
        uid: "user1",
        name: "TestUser",
        big: 10,
        small: 10,
        odd: 10,
        even: 10,
        kick: 10,
        noKick: 10,
        move: 10,
        noMove: 10,
        release: 10,
        noRelease: 10,
        goStable: 10,
        noStable: 10,
        totalAmount: 120,
        currency: "USD",
        rate: 1,
        betwin: 0,
        time: new Date(),
        odds: {},
        freeBet: false,
        roundId: 1,
        paid: false,
        playerId: "player1",
        siteId: "site1",
        operatorId: "op1",
        reachMaxWin: false,
        maxWin: 10000,
      };
      const odds = {
        big: 2.0,
        small: 2.0,
        odd: 2.0,
        even: 2.0,
        kick: 4.0,
        noKick: 1.25,
        move: 1.5,
        noMove: 3.0,
        release: 5.0,
        noRelease: 1.2,
        goStable: 8.0,
        noStable: 1.1,
      };

      // Act
      const betResult = consumer.calculateBetResult(
        settlementResult,
        bet,
        odds,
      );

      // Assert
      expect(betResult.totalBetAmount).toBe(120);
      // totalWin = 20 + 20 + 40 + 15 + 50 + 80 = 225
      expect(betResult.totalWin).toBe(225);
      expect(betResult.totalLost).toBe(60); // small + even + noKick + noMove + noRelease + noStable
      expect(betResult.winningByChoices.big).toBe(20);
      expect(betResult.winningByChoices.odd).toBe(20);
      expect(betResult.winningByChoices.kick).toBe(40);
      expect(betResult.winningByChoices.move).toBe(15);
      expect(betResult.winningByChoices.release).toBe(50);
      expect(betResult.winningByChoices.goStable).toBe(80);
    });
  });

  describe("settleRound", () => {
    test("should execute complete settlement flow", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [0, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 0,
        currentPlayers: [PlayerColor.RED],
        winners: [],
        dice: [3, 4],
        action: {
          oldPosition: 0,
          newPosition: 7,
          playerColor: PlayerColor.RED,
        },
      };
      const mockSettlementResult: ISettlementResult = {
        big: true,
        small: false,
        odd: true,
        even: false,
        kick: false,
        noKick: true,
        move: true,
        noMove: false,
        release: false,
        noRelease: true,
        goStable: false,
        noStable: true,
      };
      consumer.generateResult = jest.fn().mockReturnValue(mockResult);
      mockDeps.definition.settle = jest
        .fn()
        .mockReturnValue(mockSettlementResult);
      consumer.gameData.roundId = 10;
      consumer.gameData.initRoundId = 5;
      consumer.gameData.exchangeRates = { exId: 1, code: { USD: 1 } };
      const mockNewRound = {
        id: 10,
        result: mockResult,
        settlementResult: mockSettlementResult,
        initRoundId: 5,
        time: new Date(),
        exchangeRateId: 1,
        margins: generateMargins(0.05),
      };
      (mockDeps.roundsRepository.create as jest.Mock).mockResolvedValue(
        mockNewRound,
      );

      // Act
      await consumer.settleRound();

      // Assert
      expect(consumer.generateResult).toHaveBeenCalledTimes(1);
      expect(mockDeps.definition.settle).toHaveBeenCalledWith(mockResult);
      expect(mockDeps.roundsRepository.create).toHaveBeenCalledWith({
        id: 10,
        result: mockResult,
        settlementResult: mockSettlementResult,
        initRoundId: 5,
        time: expect.any(Date),
        exchangeRateId: 1,
        margins: generateMargins(0.05),
      });
    });

    test("should publish round result when round is created", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [0, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 0,
        currentPlayers: [PlayerColor.RED],
        winners: [],
        dice: [3, 4],
        action: {
          oldPosition: 0,
          newPosition: 7,
          playerColor: PlayerColor.RED,
        },
      };
      const mockSettlementResult: ISettlementResult = {
        big: true,
        small: false,
        odd: true,
        even: false,
        kick: false,
        noKick: true,
        move: true,
        noMove: false,
        release: false,
        noRelease: true,
        goStable: false,
        noStable: true,
      };
      consumer.generateResult = jest.fn().mockReturnValue(mockResult);
      mockDeps.definition.settle = jest
        .fn()
        .mockReturnValue(mockSettlementResult);
      consumer.gameData.roundId = 10;
      consumer.gameData.exchangeRates = { exId: 1, code: { USD: 1 } };
      const mockNewRound = {
        id: 10,
        result: mockResult,
        settlementResult: mockSettlementResult,
        time: new Date(),
      };
      (mockDeps.roundsRepository.create as jest.Mock).mockResolvedValue(
        mockNewRound,
      );

      // Act
      await consumer.settleRound();

      // Assert
      expect(
        mockDeps.roundResultPublisher.publishRoundResult,
      ).toHaveBeenCalledWith({
        result: {
          board: convertBoardState(mockResult.board),
          dice1: 3,
          dice2: 4,
          action: {
            ...mockResult.action,
            player: mockResult.action.playerColor,
            playerColor: undefined,
          },
        },
        settlementResult: mockSettlementResult,
        roundId: 10,
      });
    });

    test("should increment gameData.roundId after settlement", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      consumer.generateResult = jest.fn().mockReturnValue({
        board: {},
        winners: [],
        dice: [3, 4],
        action: {
          oldPosition: 0,
          newPosition: 7,
          playerColor: PlayerColor.RED,
        },
      } as any);
      mockDeps.definition.settle = jest.fn().mockReturnValue({});
      consumer.gameData.roundId = 10;
      consumer.gameData.exchangeRates = { exId: 1, code: { USD: 1 } };
      const mockNewRound = { id: 10, time: new Date() };
      (mockDeps.roundsRepository.create as jest.Mock).mockResolvedValue(
        mockNewRound,
      );

      // Act
      await consumer.settleRound();

      // Assert
      expect(consumer.gameData.roundId).toBe(11);
    });

    test("should update initRoundId when there are winners (new game)", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [57, 57, 57, 57],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 0,
        currentPlayers: [PlayerColor.RED],
        winners: [PlayerColor.RED],
        dice: [6, 6],
        action: {
          oldPosition: 51,
          newPosition: 57,
          playerColor: PlayerColor.RED,
        },
      };
      consumer.generateResult = jest.fn().mockReturnValue(mockResult);
      mockDeps.definition.settle = jest.fn().mockReturnValue({});
      consumer.gameData.roundId = 10;
      consumer.gameData.initRoundId = 5;
      consumer.gameData.exchangeRates = { exId: 1, code: { USD: 1 } };
      const mockNewRound = { id: 10, time: new Date() };
      (mockDeps.roundsRepository.create as jest.Mock).mockResolvedValue(
        mockNewRound,
      );

      // Act
      await consumer.settleRound();

      // Assert
      expect(consumer.gameData.roundId).toBe(11);
      expect(consumer.gameData.initRoundId).toBe(11);
    });

    test("should not update initRoundId when there are no winners", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [5, 10, 15, 20],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 1,
        currentPlayers: [PlayerColor.RED],
        winners: [],
        dice: [3, 4],
        action: {
          oldPosition: 15,
          newPosition: 22,
          playerColor: PlayerColor.RED,
        },
      };
      consumer.generateResult = jest.fn().mockReturnValue(mockResult);
      mockDeps.definition.settle = jest.fn().mockReturnValue({});
      consumer.gameData.roundId = 10;
      consumer.gameData.initRoundId = 5;
      consumer.gameData.exchangeRates = { exId: 1, code: { USD: 1 } };
      const mockNewRound = { id: 10, time: new Date() };
      (mockDeps.roundsRepository.create as jest.Mock).mockResolvedValue(
        mockNewRound,
      );

      // Act
      await consumer.settleRound();

      // Assert
      expect(consumer.gameData.roundId).toBe(11);
      expect(consumer.gameData.initRoundId).toBe(5);
    });

    test("should call settleBets with finish object", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const mockResult: IResult = {
        board: {},
        winners: [],
        dice: [3, 4],
        action: {
          oldPosition: 0,
          newPosition: 7,
          playerColor: PlayerColor.RED,
        },
      } as any;
      const mockSettlementResult = { big: true } as any;
      consumer.generateResult = jest.fn().mockReturnValue(mockResult);
      mockDeps.definition.settle = jest
        .fn()
        .mockReturnValue(mockSettlementResult);
      consumer.gameData.roundId = 10;
      consumer.gameData.exchangeRates = { exId: 1, code: { USD: 1 } };
      const mockTime = new Date();
      const mockNewRound = { id: 10, time: mockTime };
      (mockDeps.roundsRepository.create as jest.Mock).mockResolvedValue(
        mockNewRound,
      );

      // Act
      await consumer.settleRound();

      // Assert
      expect(consumer.settleBets).toHaveBeenCalledWith({
        settlementResult: mockSettlementResult,
        result: {
          ...mockResult,
          action: mockResult.action,
        },
        roundId: 10,
        time: mockTime,
      });
    });

    test("should publish winners after settlement", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      consumer.generateResult = jest.fn().mockReturnValue({
        board: {},
        winners: [],
        dice: [3, 4],
        action: {
          oldPosition: 0,
          newPosition: 7,
          playerColor: PlayerColor.RED,
        },
      } as any);
      mockDeps.definition.settle = jest.fn().mockReturnValue({});
      consumer.gameData.roundId = 10;
      consumer.gameData.exchangeRates = { exId: 1, code: { USD: 1 } };
      consumer.gameData.winningPlayers = [
        { name: "Player1", winAmount: 500 },
      ] as any;
      const mockNewRound = { id: 10, time: new Date() };
      (mockDeps.roundsRepository.create as jest.Mock).mockResolvedValue(
        mockNewRound,
      );

      // Act
      await consumer.settleRound();

      // Assert
      expect(mockDeps.roundResultPublisher.publishWinners).toHaveBeenCalledWith(
        10,
        [{ name: "Player1", winAmount: 500 }],
      );
    });

    test("should not perform settlement if roundsRepository.create returns null", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      consumer.generateResult = jest.fn().mockReturnValue({
        board: {},
        winners: [],
        dice: [3, 4],
      } as any);
      mockDeps.definition.settle = jest.fn().mockReturnValue({});
      consumer.gameData.roundId = 10;
      consumer.gameData.exchangeRates = { exId: 1, code: { USD: 1 } };
      (mockDeps.roundsRepository.create as jest.Mock).mockResolvedValue(null);

      // Act
      await consumer.settleRound();

      // Assert
      expect(
        mockDeps.roundResultPublisher.publishRoundResult,
      ).not.toHaveBeenCalled();
      expect(consumer.settleBets).not.toHaveBeenCalled();
      expect(
        mockDeps.roundResultPublisher.publishWinners,
      ).not.toHaveBeenCalled();
    });
  });

  describe("Integration scenarios", () => {
    test("should handle complete settlement with multiple winning bets", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const settlementResult: ISettlementResult = {
        big: true,
        small: false,
        odd: true,
        even: false,
        kick: true,
        noKick: false,
        move: true,
        noMove: false,
        release: false,
        noRelease: true,
        goStable: false,
        noStable: true,
      };
      const bet: IBet = {
        uid: "user1",
        name: "TestUser",
        big: 100,
        odd: 50,
        kick: 25,
        move: 75,
        small: 30,
        totalAmount: 280,
        currency: "USD",
        rate: 1,
        betwin: 0,
        time: new Date(),
        odds: {},
        freeBet: false,
        roundId: 1,
        paid: false,
        playerId: "player1",
        siteId: "site1",
        operatorId: "op1",
        reachMaxWin: false,
        maxWin: 10000,
      };
      const odds = {
        big: 1.95,
        odd: 1.95,
        kick: 4.0,
        move: 1.5,
        small: 2.35,
      };

      // Act
      const betResult = consumer.calculateBetResult(
        settlementResult,
        bet,
        odds,
      );

      // Assert
      expect(betResult.totalBetAmount).toBe(280);
      // totalWin = 195 + 97.5 + 100 + 112.5 = 505
      expect(betResult.totalWin).toBe(505);
      // netWin = (195-100) + (97.5-50) + (100-25) + (112.5-75) = 95 + 47.5 + 75 + 37.5 = 255
      expect(betResult.netWin).toBe(255);
      expect(betResult.totalLost).toBe(30);
    });
  });

  describe("Edge cases", () => {
    test("should handle bet with all choices losing", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const settlementResult: ISettlementResult = {
        big: true,
        small: false,
        odd: false,
        even: false,
        kick: false,
        noKick: false,
        move: false,
        noMove: false,
        release: false,
        noRelease: false,
        goStable: false,
        noStable: false,
      };
      const bet: IBet = {
        uid: "user1",
        name: "TestUser",
        small: 100,
        even: 50,
        totalAmount: 150,
        currency: "USD",
        rate: 1,
        betwin: 0,
        time: new Date(),
        odds: {},
        freeBet: false,
        roundId: 1,
        paid: false,
        playerId: "player1",
        siteId: "site1",
        operatorId: "op1",
        reachMaxWin: false,
        maxWin: 10000,
      };
      const odds = { small: 2.35, even: 1.95 };

      // Act
      const betResult = consumer.calculateBetResult(
        settlementResult,
        bet,
        odds,
      );

      // Assert
      expect(betResult.totalBetAmount).toBe(150);
      expect(betResult.totalWin).toBe(0);
      expect(betResult.netWin).toBe(0);
      expect(betResult.totalLost).toBe(150);
    });

    test("should handle empty bet object", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const settlementResult: ISettlementResult = {
        big: true,
        small: false,
        odd: false,
        even: false,
        kick: false,
        noKick: false,
        move: false,
        noMove: false,
        release: false,
        noRelease: false,
        goStable: false,
        noStable: false,
      };
      const bet: IBet = {
        uid: "user1",
        name: "TestUser",
        totalAmount: 0,
        currency: "USD",
        rate: 1,
        betwin: 0,
        time: new Date(),
        odds: {},
        freeBet: false,
        roundId: 1,
        paid: false,
        playerId: "player1",
        siteId: "site1",
        operatorId: "op1",
        reachMaxWin: false,
        maxWin: 10000,
      };
      const odds = { big: 1.95 };

      // Act
      const betResult = consumer.calculateBetResult(
        settlementResult,
        bet,
        odds,
      );

      // Assert
      expect(betResult.totalBetAmount).toBe(0);
      expect(betResult.totalWin).toBe(0);
      expect(betResult.netWin).toBe(0);
      expect(betResult.totalLost).toBe(0);
    });

    test("should handle very small bet amounts with precision", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new SettleGameRoundConsumer(mockDeps);
      const settlementResult: ISettlementResult = {
        big: true,
        small: false,
        odd: false,
        even: false,
        kick: false,
        noKick: false,
        move: false,
        noMove: false,
        release: false,
        noRelease: false,
        goStable: false,
        noStable: false,
      };
      const bet: IBet = {
        uid: "user1",
        name: "TestUser",
        big: 0.01,
        totalAmount: 0.01,
        currency: "USD",
        rate: 1,
        betwin: 0,
        time: new Date(),
        odds: {},
        freeBet: false,
        roundId: 1,
        paid: false,
        playerId: "player1",
        siteId: "site1",
        operatorId: "op1",
        reachMaxWin: false,
        maxWin: 10000,
      };
      const odds = { big: 1.95 };

      // Act
      const betResult = consumer.calculateBetResult(
        settlementResult,
        bet,
        odds,
      );

      // Assert
      expect(betResult.totalBetAmount).toBe(0.01);
      expect(betResult.totalWin).toBe(0.02);
      expect(betResult.netWin).toBe(0.01);
    });
  });
});

// Helper function to create mock dependencies
function createMockDependencies() {
  const mockGameData = new GameData(30000);
  mockGameData.roundId = 1;
  mockGameData.initRoundId = 1;
  mockGameData.exchangeRates = { exId: 1, code: { USD: 1 } };
  mockGameData.winningPlayers = [];
  // Set default odds (all non-zero) so existing tests continue to work
  mockGameData.odds = {
    big: 1.5,
    small: 2.0,
    odd: 2.0,
    even: 2.0,
    kick: 3.0,
    noKick: 1.2,
    move: 1.5,
    noMove: 2.5,
    release: 4.0,
    noRelease: 1.1,
    goStable: 5.0,
    noStable: 1.05,
  };
  mockGameData.gameConfigs = {
    odds: generateMargins(0.05),
  } as any;

  const mockDefinition = {
    settle: jest.fn(),
  } as any;

  const mockRoundsRepository = {
    create: jest.fn(),
  } as any;

  const mockBetsRepository = {} as any;

  const mockTempBetsRepository = {} as any;

  const mockRoundResultPublisher = {
    publishRoundResult: jest.fn(),
    publishWinners: jest.fn(),
  } as any;

  const mockUserBetResultPublisher = {
    publishUserBetResult: jest.fn(),
  } as any;

  const mockEndGame = jest.fn();

  return {
    gameData: mockGameData,
    definition: mockDefinition,
    roundsRepository: mockRoundsRepository as mongoose.Model<IRound>,
    betsRepository: mockBetsRepository,
    tempBetsRepository: mockTempBetsRepository,
    roundResultPublisher: mockRoundResultPublisher,
    userBetResultPublisher: mockUserBetResultPublisher,
    endGame: mockEndGame,
  };
}
