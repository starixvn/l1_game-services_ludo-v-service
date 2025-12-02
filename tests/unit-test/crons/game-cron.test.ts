import { PlayerColor } from "@rd/ludo-rules";
import { GameCron } from "../../../src/crons/game-cron.js";
import GameData from "../../../src/game-data.js";
import {
  generateMargins,
  generateMarginsWithoutPrefix,
} from "../__mock__/margins.js";

// Mock sc-game-base to avoid constructor issues
jest.mock("sc-game-base", () => {
  const mockBaseClass = class MockTableGameCron {
    bot: any;
    definition: any;
    gameData: any;
    settleGameRoundConsumer: any;
    gameStatusPublisher: any;
    runningRoundInfoPublisher: any;
    logService: any;
    roundResultConsumer: any;
    resultsRepository: any;
    appConfigs: any;
    gameManagementApiClientFactory: any;
    roundIdConsumer: any;
    provablyFairConsumer: any;
    unsettledRoundConsumer: any;
    promotionFreeSpinsConsumer: any;

    constructor(params: any) {
      Object.assign(this, params);
    }

    resetForNewRound = jest.fn();
    isStartingTime = jest.fn();
    startCron = jest.fn();
    getSettingForNewRound = jest.fn();
    updateExchangeRates = jest.fn();
    checkPromotionReadiness = jest.fn();
    checkGameStatus = jest.fn();
  };

  return {
    Table: {
      Crons: {
        TableGameCron: mockBaseClass,
        TableGameBot: class MockTableGameBot {
          resetInRoomTrackings = jest.fn();
          reset = jest.fn();
          run = jest.fn();
        },
      },
      TableGameData: class MockTableGameData {
        remainingTime: number;
        roundId: number;
        totalBets: any;
        chips: any;
        result: any;
        constructor(remainingTime: number) {
          this.remainingTime = remainingTime;
          this.roundId = 0;
          this.totalBets = {};
          this.chips = [];
          this.result = {};
        }
      },
    },
  };
});

describe("GameCron", () => {
  describe("Class definition", () => {
    test("should be defined", () => {
      // Arrange & Act & Assert
      expect(GameCron).toBeDefined();
    });

    test("should extend from TableGameCron base class", () => {
      // Arrange
      const mockDeps = createMockDependencies();

      // Act
      const gameCron = new GameCron(mockDeps);

      // Assert
      expect(gameCron).toBeInstanceOf(GameCron);
      expect(gameCron.start).toBeDefined();
      expect(gameCron.proceed).toBeDefined();
      expect(gameCron.calculateOdds).toBeDefined();
    });

    test("should have required methods", () => {
      // Arrange & Act
      const hasRequiredMethods =
        GameCron.prototype.start !== undefined &&
        GameCron.prototype.proceed !== undefined &&
        GameCron.prototype.calculateOdds !== undefined;

      // Assert
      expect(hasRequiredMethods).toBe(true);
      expect(GameCron.prototype.start).toBeDefined();
      expect(GameCron.prototype.proceed).toBeDefined();
      expect(GameCron.prototype.calculateOdds).toBeDefined();
    });
  });

  describe("Constructor", () => {
    test("should initialize with all required dependencies", () => {
      // Arrange
      const mockDeps = createMockDependencies();

      // Act
      const gameCron = new GameCron(mockDeps);

      // Assert
      expect(gameCron.definition).toBe(mockDeps.definition);
      expect(gameCron.gameData).toBe(mockDeps.gameData);
      expect(gameCron.bot).toBe(mockDeps.bot);
      expect(gameCron.roundConsumer).toBe(mockDeps.roundConsumer);
      expect(gameCron.settleGameRoundConsumer).toBe(
        mockDeps.settleGameRoundConsumer,
      );
      expect(gameCron.roundResultConsumer).toBe(mockDeps.roundResultConsumer);
    });

    test("should pass all dependencies to parent class", () => {
      // Arrange
      const mockDeps = createMockDependencies();

      // Act
      const gameCron = new GameCron(mockDeps);

      // Assert
      expect(gameCron.gameStatusPublisher).toBe(mockDeps.gameStatusPublisher);
      expect(gameCron.runningRoundInfoPublisher).toBe(
        mockDeps.runningRoundInfoPublisher,
      );
      expect(gameCron.logService).toBe(mockDeps.logService);
      expect(gameCron.resultsRepository).toBe(mockDeps.resultsRepository);
      expect(gameCron.appConfigs).toBe(mockDeps.appConfigs);
    });

    test("should store roundConsumer as instance property", () => {
      // Arrange
      const mockDeps = createMockDependencies();

      // Act
      const gameCron = new GameCron(mockDeps);

      // Assert
      expect(gameCron.roundConsumer).toBeDefined();
      expect(gameCron.roundConsumer).toBe(mockDeps.roundConsumer);
    });
  });

  describe("Method signatures", () => {
    test("start should be an async function", () => {
      // Arrange
      const method = GameCron.prototype.start;

      // Act
      const isAsync = method.constructor.name === "AsyncFunction";

      // Assert
      expect(method).toBeDefined();
      expect(isAsync).toBe(true);
    });

    test("calculateOdds should be an async function", () => {
      // Arrange
      const method = GameCron.prototype.calculateOdds;

      // Act
      const isAsync = method.constructor.name === "AsyncFunction";

      // Assert
      expect(method).toBeDefined();
      expect(isAsync).toBe(true);
    });

    test("proceed should be an async function", () => {
      // Arrange
      const method = GameCron.prototype.proceed;

      // Act
      const isAsync = method.constructor.name === "AsyncFunction";

      // Assert
      expect(method).toBeDefined();
      expect(isAsync).toBe(true);
    });
  });

  describe("start", () => {
    test("should execute initialization sequence in correct order", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      const callOrder: string[] = [];

      mockDeps.bot.resetInRoomTrackings.mockImplementation(() => {
        callOrder.push("resetInRoomTrackings");
        return Promise.resolve();
      });
      mockDeps.roundConsumer.initNewRound.mockImplementation(() => {
        callOrder.push("initNewRound");
        return Promise.resolve();
      });
      gameCron.getSettingForNewRound = jest.fn().mockImplementation(() => {
        callOrder.push("getSettingForNewRound");
        return Promise.resolve();
      });
      gameCron.updateExchangeRates = jest.fn().mockImplementation(() => {
        callOrder.push("updateExchangeRates");
        return Promise.resolve();
      });
      gameCron.checkPromotionReadiness = jest.fn().mockImplementation(() => {
        callOrder.push("checkPromotionReadiness");
      });
      mockDeps.promotionFreeSpinsConsumer.loadPromotionsRunning.mockImplementation(
        () => {
          callOrder.push("loadPromotionsRunning");
          return Promise.resolve();
        },
      );
      mockDeps.unsettledRoundConsumer.proceed.mockImplementation(() => {
        callOrder.push("unsettledRoundConsumer.proceed");
        return Promise.resolve();
      });
      gameCron.startCron = jest.fn().mockImplementation(() => {
        callOrder.push("startCron");
      });

      // Act
      await gameCron.start();

      // Assert
      expect(callOrder).toEqual([
        "resetInRoomTrackings",
        "initNewRound",
        "getSettingForNewRound",
        "updateExchangeRates",
        "checkPromotionReadiness",
        "loadPromotionsRunning",
        "unsettledRoundConsumer.proceed",
        "startCron",
      ]);
    });

    test("should call bot.resetInRoomTrackings", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);

      // Act
      await gameCron.start();

      // Assert
      expect(mockDeps.bot.resetInRoomTrackings).toHaveBeenCalledTimes(1);
    });

    test("should call roundConsumer.initNewRound", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);

      // Act
      await gameCron.start();

      // Assert
      expect(mockDeps.roundConsumer.initNewRound).toHaveBeenCalledTimes(1);
    });

    test("should call getSettingForNewRound", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.getSettingForNewRound = jest.fn().mockResolvedValue(undefined);

      // Act
      await gameCron.start();

      // Assert
      expect(gameCron.getSettingForNewRound).toHaveBeenCalledTimes(1);
    });

    test("should call updateExchangeRates", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.updateExchangeRates = jest.fn().mockResolvedValue(undefined);

      // Act
      await gameCron.start();

      // Assert
      expect(gameCron.updateExchangeRates).toHaveBeenCalledTimes(1);
    });

    test("should call checkPromotionReadiness", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.checkPromotionReadiness = jest.fn();

      // Act
      await gameCron.start();

      // Assert
      expect(gameCron.checkPromotionReadiness).toHaveBeenCalledTimes(1);
    });

    test("should call promotionFreeSpinsConsumer.loadPromotionsRunning", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);

      // Act
      await gameCron.start();

      // Assert
      expect(
        mockDeps.promotionFreeSpinsConsumer.loadPromotionsRunning,
      ).toHaveBeenCalledTimes(1);
    });

    test("should call unsettledRoundConsumer.proceed", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);

      // Act
      await gameCron.start();

      // Assert
      expect(mockDeps.unsettledRoundConsumer.proceed).toHaveBeenCalledTimes(1);
    });

    test("should call startCron at the end", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.startCron = jest.fn();

      // Act
      await gameCron.start();

      // Assert
      expect(gameCron.startCron).toHaveBeenCalledTimes(1);
    });
  });

  describe("calculateOdds", () => {
    test("should call definition.generateOdds with margin and result", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      const margins = generateMargins(0.05);
      const result = {
        board: {
          [PlayerColor.RED]: [0, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 0,
        currentPlayers: [PlayerColor.RED],
        winners: [],
        dice: [],
        action: {
          oldPosition: 0,
          newPosition: 0,
          playerColor: PlayerColor.RED,
        },
      };
      gameCron.gameData.gameConfigs = {
        gameId: 1,
        enabled: true,
        odds: margins,
        originalOdds: {} as any,
        enableFreeBet: false,
        boostedChoices: false,
      };
      gameCron.gameData.result = result;
      const expectedOdds = { big: 1.95, small: 2.35 };
      mockDeps.definition.generateOdds.mockResolvedValue(expectedOdds);

      // Act
      await gameCron.calculateOdds();

      // Assert
      expect(mockDeps.definition.generateOdds).toHaveBeenCalledWith(
        generateMarginsWithoutPrefix(0.05),
        result,
      );
      expect(mockDeps.definition.generateOdds).toHaveBeenCalledTimes(1);
    });

    test("should set gameData.odds with generated odds", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      const expectedOdds = {
        big: 1.95,
        small: 2.35,
        move: 1.5,
        noMove: 3.0,
      };
      gameCron.gameData.gameConfigs = {
        gameId: 1,
        enabled: true,
        odds: generateMargins(0.05),
        originalOdds: {} as any,
        enableFreeBet: false,
        boostedChoices: false,
      };
      mockDeps.definition.generateOdds.mockResolvedValue(expectedOdds);

      // Act
      await gameCron.calculateOdds();

      // Assert
      expect(gameCron.gameData.odds).toEqual(expectedOdds);
    });

    test("should use margin from gameData.gameConfigs.odds", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      const customMargins = generateMargins(0.08);
      gameCron.gameData.gameConfigs = {
        gameId: 1,
        enabled: true,
        odds: customMargins,
        originalOdds: {} as any,
        enableFreeBet: false,
        boostedChoices: false,
      };

      // Act
      await gameCron.calculateOdds();

      // Assert
      expect(mockDeps.definition.generateOdds).toHaveBeenCalledWith(
        generateMarginsWithoutPrefix(0.08),
        expect.any(Object),
      );
    });
  });

  describe("proceed", () => {
    test("should call checkGameStatus when remainingTime equals wholeRound", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.gameData.remainingTime = 30000;
      gameCron.definition.durations = {
        wholeRound: 30000,
        placingBets: 20000,
        lockingBet: 5000,
      };
      gameCron.checkGameStatus = jest.fn().mockResolvedValue(undefined);

      // Act
      await gameCron.proceed();

      // Assert
      expect(gameCron.checkGameStatus).toHaveBeenCalledTimes(1);
    });

    test("should not call checkGameStatus when remainingTime does not equal wholeRound", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.gameData.remainingTime = 25000;
      gameCron.definition.durations = {
        wholeRound: 30000,
        placingBets: 20000,
        lockingBet: 5000,
      };
      gameCron.checkGameStatus = jest.fn().mockResolvedValue(undefined);

      // Act
      await gameCron.proceed();

      // Assert
      expect(gameCron.checkGameStatus).not.toHaveBeenCalled();
    });

    test("should decrement remainingTime when game is not disabled", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.gameData.remainingTime = 25000;
      gameCron.gameData.disabled = false;
      gameCron.definition.durations = {
        wholeRound: 30000,
        placingBets: 20000,
        lockingBet: 5000,
      };

      // Act
      await gameCron.proceed();

      // Assert
      expect(gameCron.gameData.remainingTime).toBe(24999);
    });

    test("should not decrement remainingTime when game is disabled", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.gameData.remainingTime = 25000;
      gameCron.gameData.disabled = true;
      gameCron.definition.durations = {
        wholeRound: 30000,
        placingBets: 20000,
        lockingBet: 5000,
      };

      // Act
      await gameCron.proceed();

      // Assert
      expect(gameCron.gameData.remainingTime).toBe(25000);
    });

    test("should reset for new round and calculate odds at starting time", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.gameData.remainingTime = 30000;
      gameCron.gameData.disabled = false;
      gameCron.definition.durations = {
        wholeRound: 30000,
        placingBets: 20000,
        lockingBet: 5000,
      };
      gameCron.isStartingTime = jest.fn().mockReturnValue(true);
      gameCron.resetForNewRound = jest.fn();
      gameCron.calculateOdds = jest.fn().mockResolvedValue(undefined);

      // Act
      await gameCron.proceed();

      // Assert
      expect(gameCron.isStartingTime).toHaveBeenCalledWith(
        29999,
        gameCron.definition.durations,
      );
      expect(gameCron.resetForNewRound).toHaveBeenCalledTimes(1);
      expect(gameCron.calculateOdds).toHaveBeenCalledTimes(1);
    });

    test("should reset bot at starting time when bot exists", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.gameData.remainingTime = 30000;
      gameCron.gameData.disabled = false;
      gameCron.definition.durations = {
        wholeRound: 30000,
        placingBets: 20000,
        lockingBet: 5000,
      };
      gameCron.isStartingTime = jest.fn().mockReturnValue(true);
      gameCron.calculateOdds = jest.fn().mockResolvedValue(undefined);

      // Act
      await gameCron.proceed();

      // Assert
      expect(mockDeps.bot.reset).toHaveBeenCalledTimes(1);
    });

    test("should publish start placing bet status at placingBets time", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.gameData.remainingTime = 20001;
      gameCron.gameData.disabled = false;
      gameCron.definition.durations = {
        wholeRound: 30000,
        placingBets: 20000,
        lockingBet: 5000,
      };

      // Act
      await gameCron.proceed();

      // Assert
      expect(
        mockDeps.gameStatusPublisher.publishStartPlacingBetStatus,
      ).toHaveBeenCalledTimes(1);
    });

    test("should publish end placing bet status at lockingBet - 1 time", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.gameData.remainingTime = 5000;
      gameCron.gameData.disabled = false;
      gameCron.definition.durations = {
        wholeRound: 30000,
        placingBets: 20000,
        lockingBet: 5000,
      };

      // Act
      await gameCron.proceed();

      // Assert
      expect(
        mockDeps.gameStatusPublisher.publishEndPlacingBetStatus,
      ).toHaveBeenCalledTimes(1);
    });

    test("should generate result and settle round when remainingTime is negative", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.gameData.remainingTime = 0;
      gameCron.gameData.disabled = false;
      gameCron.gameData.settlementResultFromAdmin = {
        roundId: 1,
        result: { dice: [1, 2] },
      };
      gameCron.definition.durations = {
        wholeRound: 30000,
        placingBets: 20000,
        lockingBet: 5000,
      };

      // Act
      await gameCron.proceed();

      // Assert
      expect(gameCron.gameData.remainingTime).toBe(30000);
      expect(mockDeps.roundResultConsumer.generateResult).toHaveBeenCalledTimes(
        1,
      );
      expect(
        mockDeps.settleGameRoundConsumer.settleRound,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockDeps.promotionFreeSpinsConsumer.loadPromotionsRunning,
      ).toHaveBeenCalledTimes(1);
      expect(gameCron.gameData.settlementResultFromAdmin).toEqual({});
    });

    test("should run bot and publish running round info when remainingTime is between 0 and placingBets", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.gameData.remainingTime = 15000;
      gameCron.gameData.disabled = false;
      gameCron.definition.durations = {
        wholeRound: 30000,
        placingBets: 20000,
        lockingBet: 5000,
      };

      // Act
      await gameCron.proceed();

      // Assert
      expect(mockDeps.bot.run).toHaveBeenCalledTimes(1);
      expect(mockDeps.runningRoundInfoPublisher.publish).toHaveBeenCalledTimes(
        1,
      );
    });

    test("should not run bot when bot is not available", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.bot = null as any;
      gameCron.gameData.remainingTime = 15000;
      gameCron.gameData.disabled = false;
      gameCron.definition.durations = {
        wholeRound: 30000,
        placingBets: 20000,
        lockingBet: 5000,
      };

      // Act
      await gameCron.proceed();

      // Assert - Should not throw error
      expect(mockDeps.runningRoundInfoPublisher.publish).toHaveBeenCalledTimes(
        1,
      );
    });

    test("should check promotion expiry with gameId", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.gameData.gameConfigs = {
        gameId: 123,
        enabled: true,
        odds: { margin: 0.05 },
        originalOdds: {} as any,
        enableFreeBet: false,
        boostedChoices: false,
      };
      gameCron.gameData.remainingTime = 15000;
      gameCron.definition.durations = {
        wholeRound: 30000,
        placingBets: 20000,
        lockingBet: 5000,
      };

      // Act
      await gameCron.proceed();

      // Assert
      expect(
        mockDeps.promotionFreeSpinsConsumer.checkExpiry,
      ).toHaveBeenCalledWith(123);
      expect(
        mockDeps.promotionFreeSpinsConsumer.checkExpiry,
      ).toHaveBeenCalledTimes(1);
    });

    test("should handle complete round lifecycle", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.gameData.remainingTime = 30000;
      gameCron.gameData.disabled = false;
      gameCron.gameData.gameConfigs = {
        gameId: 1,
        enabled: true,
        odds: { margin: 0.05 },
        originalOdds: {} as any,
        enableFreeBet: false,
        boostedChoices: false,
      };
      gameCron.definition.durations = {
        wholeRound: 30000,
        placingBets: 20000,
        lockingBet: 5000,
      };
      gameCron.checkGameStatus = jest.fn().mockResolvedValue(undefined);
      gameCron.isStartingTime = jest.fn().mockReturnValue(true);
      gameCron.resetForNewRound = jest.fn();
      gameCron.calculateOdds = jest.fn().mockResolvedValue(undefined);

      // Act
      await gameCron.proceed();

      // Assert - At starting time (wholeRound)
      expect(gameCron.checkGameStatus).toHaveBeenCalledTimes(1);
      expect(gameCron.isStartingTime).toHaveBeenCalledTimes(1);
      expect(gameCron.resetForNewRound).toHaveBeenCalledTimes(1);
      expect(gameCron.calculateOdds).toHaveBeenCalledTimes(1);
      expect(mockDeps.bot.reset).toHaveBeenCalledTimes(1);
      expect(
        mockDeps.promotionFreeSpinsConsumer.checkExpiry,
      ).toHaveBeenCalledWith(1);
    });

    test("should reset settlementResultFromAdmin to empty object after settling", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.gameData.remainingTime = 0;
      gameCron.gameData.disabled = false;
      gameCron.gameData.settlementResultFromAdmin = {
        roundId: 1,
        result: { dice: [1, 2] },
      };
      gameCron.definition.durations = {
        wholeRound: 30000,
        placingBets: 20000,
        lockingBet: 5000,
      };

      // Act
      await gameCron.proceed();

      // Assert
      expect(gameCron.gameData.settlementResultFromAdmin).toEqual({});
    });
  });

  describe("Integration scenarios", () => {
    test("should handle multiple proceed calls simulating time progression", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.gameData.remainingTime = 30000;
      gameCron.gameData.disabled = false;
      gameCron.gameData.gameConfigs = {
        gameId: 1,
        enabled: true,
        odds: { margin: 0.05 },
        originalOdds: {} as any,
        enableFreeBet: false,
        boostedChoices: false,
      };
      gameCron.definition.durations = {
        wholeRound: 30000,
        placingBets: 20000,
        lockingBet: 5000,
      };
      gameCron.checkGameStatus = jest.fn().mockResolvedValue(undefined);

      // Act - Simulate 5 time ticks
      await gameCron.proceed(); // 30000 -> 29999
      await gameCron.proceed(); // 29999 -> 29998
      await gameCron.proceed(); // 29998 -> 29997
      await gameCron.proceed(); // 29997 -> 29996
      await gameCron.proceed(); // 29996 -> 29995

      // Assert
      expect(gameCron.gameData.remainingTime).toBe(29995);
    });

    test("should handle transition from placingBets phase to lockingBet phase", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.gameData.remainingTime = 20001;
      gameCron.gameData.disabled = false;
      gameCron.gameData.gameConfigs = {
        gameId: 1,
        enabled: true,
        odds: { margin: 0.05 },
        originalOdds: {} as any,
        enableFreeBet: false,
        boostedChoices: false,
      };
      gameCron.definition.durations = {
        wholeRound: 30000,
        placingBets: 20000,
        lockingBet: 5000,
      };

      // Act
      await gameCron.proceed(); // Should trigger start placing bets

      // Assert
      expect(
        mockDeps.gameStatusPublisher.publishStartPlacingBetStatus,
      ).toHaveBeenCalledTimes(1);
      expect(gameCron.gameData.remainingTime).toBe(20000);
    });
  });

  describe("Edge cases", () => {
    test("should handle bot being undefined during proceed", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.bot = undefined as any;
      gameCron.gameData.remainingTime = 15000;
      gameCron.gameData.disabled = false;
      gameCron.definition.durations = {
        wholeRound: 30000,
        placingBets: 20000,
        lockingBet: 5000,
      };

      // Act & Assert - Should not throw error
      await expect(gameCron.proceed()).resolves.not.toThrow();
    });

    test("should handle zero remaining time transition", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.gameData.remainingTime = 1;
      gameCron.gameData.disabled = false;
      gameCron.definition.durations = {
        wholeRound: 30000,
        placingBets: 20000,
        lockingBet: 5000,
      };

      // Act
      await gameCron.proceed();

      // Assert
      // When remainingTime is 1, it decrements to 0, which is not < 0
      // So it doesn't trigger the reset. It should be 0.
      expect(gameCron.gameData.remainingTime).toBe(0);
      expect(
        mockDeps.roundResultConsumer.generateResult,
      ).not.toHaveBeenCalled();
      expect(
        mockDeps.settleGameRoundConsumer.settleRound,
      ).not.toHaveBeenCalled();
    });

    test("should handle negative remaining time", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const gameCron = new GameCron(mockDeps);
      gameCron.gameData.remainingTime = -5;
      gameCron.gameData.disabled = false;
      gameCron.definition.durations = {
        wholeRound: 30000,
        placingBets: 20000,
        lockingBet: 5000,
      };

      // Act
      await gameCron.proceed();

      // Assert
      expect(gameCron.gameData.remainingTime).toBe(30000);
      expect(mockDeps.roundResultConsumer.generateResult).toHaveBeenCalledTimes(
        1,
      );
    });
  });
});

// Helper function to create mock dependencies
function createMockDependencies() {
  const mockGameData = new GameData(30000);
  mockGameData.gameConfigs = {
    gameId: 1,
    enabled: true,
    odds: { margin: 0.05 },
    originalOdds: {} as any,
    enableFreeBet: false,
    boostedChoices: false,
  };
  mockGameData.result = {
    board: {
      [PlayerColor.RED]: [0, 0, 0, 0],
      [PlayerColor.GREEN]: [0, 0, 0, 0],
      [PlayerColor.YELLOW]: [0, 0, 0, 0],
      [PlayerColor.BLUE]: [0, 0, 0, 0],
    },
    nextTurnIndex: 0,
    currentPlayers: [PlayerColor.RED],
    winners: [],
    dice: [],
    action: {
      oldPosition: 0,
      newPosition: 0,
      playerColor: PlayerColor.RED,
    },
  };
  mockGameData.settlementResultFromAdmin = {} as any;

  const mockDefinition = {
    durations: {
      wholeRound: 30000,
      placingBets: 20000,
      lockingBet: 5000,
    },
    generateOdds: jest.fn().mockResolvedValue({}),
    generateResult: jest.fn().mockResolvedValue({}),
  } as any;

  const mockBot = {
    resetInRoomTrackings: jest.fn().mockResolvedValue(undefined),
    reset: jest.fn(),
    run: jest.fn().mockResolvedValue(undefined),
  };

  const mockRoundConsumer = {
    initNewRound: jest.fn().mockResolvedValue(undefined),
  };

  const mockSettleGameRoundConsumer = {
    settleRound: jest.fn().mockResolvedValue(undefined),
  };

  const mockGameStatusPublisher = {
    publishStartPlacingBetStatus: jest.fn(),
    publishEndPlacingBetStatus: jest.fn(),
  };

  const mockRunningRoundInfoPublisher = {
    publish: jest.fn(),
    publishInfoForNewRound: jest.fn().mockResolvedValue(undefined),
  };

  const mockLogService = {};

  const mockRoundResultConsumer = {
    generateResult: jest.fn().mockResolvedValue(undefined),
  };

  const mockResultsRepository = {};

  const mockAppConfigs = {};

  const mockGameManagementApiClientFactory = {};

  const mockRoundIdConsumer = {};

  const mockProvablyFairConsumer = {};

  const mockUnsettledRoundConsumer = {
    proceed: jest.fn().mockResolvedValue(undefined),
  };

  const mockPromotionFreeSpinsConsumer = {
    loadPromotionsRunning: jest.fn().mockResolvedValue(undefined),
    checkExpiry: jest.fn().mockResolvedValue(undefined),
  };

  return {
    definition: mockDefinition,
    gameData: mockGameData,
    bot: mockBot,
    settleGameRoundConsumer: mockSettleGameRoundConsumer,
    gameStatusPublisher: mockGameStatusPublisher,
    runningRoundInfoPublisher: mockRunningRoundInfoPublisher,
    logService: mockLogService,
    roundResultConsumer: mockRoundResultConsumer,
    resultsRepository: mockResultsRepository,
    appConfigs: mockAppConfigs,
    gameManagementApiClientFactory: mockGameManagementApiClientFactory,
    roundIdConsumer: mockRoundIdConsumer,
    provablyFairConsumer: mockProvablyFairConsumer,
    unsettledRoundConsumer: mockUnsettledRoundConsumer,
    promotionFreeSpinsConsumer: mockPromotionFreeSpinsConsumer,
    roundConsumer: mockRoundConsumer,
  };
}
