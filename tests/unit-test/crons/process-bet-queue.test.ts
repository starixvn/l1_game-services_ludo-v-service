import { PlayerColor } from "@rd/ludo-rules";
import { ProcessBetQueue } from "../../../src/crons/process-bet-queue.js";

// Mock sc-game-base to avoid constructor issues
jest.mock("sc-game-base", () => {
  const mockBaseClass = class MockTableProcessBetQueue {
    definition: any;
    gameData: any;
    placeBetPublisher: any;
    placeBet: any;
    logService: any;
    betsRepository: any;
    betLogsRepository: any;
    gameManagementApiClient: any;
    baseMetrics: any;
    processTimeOut: number;

    constructor(params: any) {
      Object.assign(this, params);
      this.processTimeOut = 50;
    }

    start = jest.fn();
    dequeueBets = jest.fn();
    proceedBet = jest.fn();
    validateBetRequest = jest.fn();
    composeValidationCriteria = jest.fn();
    composeBettingTimeValidationCriteria = jest.fn();
    updateUserStakeLevel = jest.fn();
    formatApiBetInfo = jest.fn();
    handleSuccessBet = jest.fn();
    handleFailedBet = jest.fn();
    insertBetLog = jest.fn();
    decreaseBetTracks = jest.fn();
    adjustOwnBets = jest.fn();
    adjustTotalBets = jest.fn();
    notifyPlacingBetResult = jest.fn();
    generatePlacingBetResult = jest.fn();
    calculateCurrencyRate = jest.fn();
    isCountOnTotalBets = jest.fn();
    initializeInterceptors = jest.fn();
    getApplicableInterceptors = jest.fn();
    executeInterceptorEvent = jest.fn();
    executeInterceptorTransform = jest.fn();
  };

  return {
    Table: {
      Crons: {
        TableProcessBetQueue: mockBaseClass,
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

describe("ProcessBetQueue", () => {
  describe("Class definition", () => {
    test("should be defined", () => {
      // Arrange & Act & Assert
      expect(ProcessBetQueue).toBeDefined();
    });

    test("should extend from TableProcessBetQueue base class", () => {
      // Arrange
      const mockDeps = createMockDependencies();

      // Act
      const processBetQueue = new ProcessBetQueue(mockDeps);

      // Assert
      expect(processBetQueue).toBeInstanceOf(ProcessBetQueue);
      expect(processBetQueue.upsertBet).toBeDefined();
    });

    test("should have required properties", () => {
      // Arrange
      const mockDeps = createMockDependencies();

      // Act
      const processBetQueue = new ProcessBetQueue(mockDeps);

      // Assert
      expect(processBetQueue.gameData).toBeDefined();
      expect(processBetQueue.betsRepository).toBeDefined();
    });
  });

  describe("Constructor", () => {
    test("should initialize with all required dependencies", () => {
      // Arrange
      const mockDeps = createMockDependencies();

      // Act
      const processBetQueue = new ProcessBetQueue(mockDeps);

      // Assert
      expect(processBetQueue.gameData).toBe(mockDeps.gameData);
      expect(processBetQueue.betsRepository).toBe(mockDeps.betsRepository);
    });

    test("should declare gameData property", () => {
      // Arrange
      const mockDeps = createMockDependencies();

      // Act
      const processBetQueue = new ProcessBetQueue(mockDeps);

      // Assert
      expect(processBetQueue.gameData).toBeDefined();
      expect(processBetQueue.gameData).toBe(mockDeps.gameData);
    });

    test("should declare betsRepository property", () => {
      // Arrange
      const mockDeps = createMockDependencies();

      // Act
      const processBetQueue = new ProcessBetQueue(mockDeps);

      // Assert
      expect(processBetQueue.betsRepository).toBeDefined();
      expect(typeof processBetQueue.betsRepository.updateOne).toBe("function");
    });
  });

  describe("upsertBet", () => {
    test("should create new bet record with basic player information", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const bet = {
        betChoice: "big",
        amount: 100,
        clientSeed: "test-seed-123",
      };
      const rate = 1.0;
      const applicableInterceptors = null;

      // Act
      await processBetQueue.upsertBet(
        player,
        roundId,
        bet,
        rate,
        applicableInterceptors,
      );

      // Assert
      expect(mockDeps.betsRepository.updateOne).toHaveBeenCalledTimes(1);
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      expect(callArgs[0]).toEqual({ uid: player.UID, roundId });
      expect(callArgs[2]).toEqual({
        upsert: true,
        setDefaultsOnInsert: true,
      });
    });

    test("should include odds from game configs in bet record", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const bet = {
        betChoice: "small",
        amount: 50,
        clientSeed: "seed-456",
      };
      const rate = 1.0;
      const expectedOdds = {
        big: 1.95,
        small: 2.05,
        odd: 1.9,
        even: 1.9,
        kick: 2.5,
        noKick: 1.5,
        move: 1.85,
        noMove: 2.15,
        release: 2.2,
        noRelease: 1.75,
        goStable: 2.0,
        noStable: 1.8,
      };
      processBetQueue.gameData.odds = expectedOdds;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const setOnInsertData = callArgs[1].$setOnInsert;
      expect(setOnInsertData.odds).toEqual(expectedOdds);
    });

    test("should include margin from game configs in bet record", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const bet = {
        betChoice: "move",
        amount: 200,
        clientSeed: "seed-789",
      };
      const rate = 1.0;
      const expectedMargin = 0.05;
      processBetQueue.gameData.gameConfigs.odds.margin = expectedMargin;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const setOnInsertData = callArgs[1].$setOnInsert;
      expect(setOnInsertData.margin).toBe(expectedMargin);
    });

    test("should set increment for bet amount on specific bet choice", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const bet = {
        betChoice: "kick",
        amount: 150,
        clientSeed: "seed-abc",
      };
      const rate = 1.0;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const incrementData = callArgs[1].$inc;
      expect(incrementData[bet.betChoice]).toBe(bet.amount);
      expect(incrementData.totalAmount).toBe(bet.amount);
    });

    test("should include player session data when session exists", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const bet = {
        betChoice: "release",
        amount: 75,
        clientSeed: "seed-def",
      };
      const rate = 1.5;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const setOnInsertData = callArgs[1].$setOnInsert;
      expect(setOnInsertData.siteId).toBe(player.session.siteId);
      expect(setOnInsertData.currency).toBe(player.session.currencyName);
      expect(setOnInsertData.rate).toBe(rate);
      expect(setOnInsertData.operatorId).toBe(player.session.operatorId);
      expect(setOnInsertData.playerId).toBe(player.session.playerId);
      expect(setOnInsertData.appType).toBe(player.session.system);
      expect(setOnInsertData.siteName).toBe(player.session.siteName);
    });

    test("should use uid and roundId as filter for updating existing bet", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 99999;
      const bet = {
        betChoice: "goStable",
        amount: 250,
        clientSeed: "seed-ghi",
      };
      const rate = 1.0;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const filter = callArgs[0];
      expect(filter.uid).toBe(player.UID);
      expect(filter.roundId).toBe(roundId);
    });

    test("should return bet time after upserting", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const bet = {
        betChoice: "noMove",
        amount: 100,
        clientSeed: "seed-jkl",
      };
      const rate = 1.0;

      // Act
      const result = await processBetQueue.upsertBet(
        player,
        roundId,
        bet,
        rate,
        null,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result instanceof Date).toBe(true);
    });

    test("should include uid in bet record", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      player.UID = "unique-user-id-123";
      const roundId = 12345;
      const bet = {
        betChoice: "big",
        amount: 100,
        clientSeed: "seed-mno",
      };
      const rate = 1.0;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const setOnInsertData = callArgs[1].$setOnInsert;
      expect(setOnInsertData.uid).toBe(player.UID);
    });

    test("should include player name in bet record", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      player.profile.name = "TestPlayer123";
      const roundId = 12345;
      const bet = {
        betChoice: "small",
        amount: 50,
        clientSeed: "seed-pqr",
      };
      const rate = 1.0;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const setOnInsertData = callArgs[1].$setOnInsert;
      expect(setOnInsertData.name).toBe(player.profile.name);
    });

    test("should include roundId in bet record", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 54321;
      const bet = {
        betChoice: "move",
        amount: 200,
        clientSeed: "seed-stu",
      };
      const rate = 1.0;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const setOnInsertData = callArgs[1].$setOnInsert;
      expect(setOnInsertData.roundId).toBe(roundId);
    });

    test("should include clientSeed in bet record", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const clientSeed = "unique-client-seed-vwx";
      const bet = {
        betChoice: "kick",
        amount: 150,
        clientSeed,
      };
      const rate = 1.0;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const setOnInsertData = callArgs[1].$setOnInsert;
      expect(setOnInsertData.clientSeed).toBe(clientSeed);
    });

    test("should include time as Date object in bet record", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const bet = {
        betChoice: "release",
        amount: 75,
        clientSeed: "seed-yza",
      };
      const rate = 1.0;

      // Act
      const beforeTime = new Date();
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);
      const afterTime = new Date();

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const setOnInsertData = callArgs[1].$setOnInsert;
      expect(setOnInsertData.time instanceof Date).toBe(true);
      expect(setOnInsertData.time.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(setOnInsertData.time.getTime()).toBeLessThanOrEqual(
        afterTime.getTime(),
      );
    });

    test("should handle player without session", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      player.session = null as any;
      const roundId = 12345;
      const bet = {
        betChoice: "big",
        amount: 100,
        clientSeed: "seed-bcd",
      };
      const rate = 1.0;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const setOnInsertData = callArgs[1].$setOnInsert;
      expect(setOnInsertData.siteId).toBeUndefined();
      expect(setOnInsertData.currency).toBeUndefined();
      expect(setOnInsertData.operatorId).toBeUndefined();
    });

    test("should call executeInterceptorTransform when interceptors are provided", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const bet = {
        betChoice: "small",
        amount: 100,
        clientSeed: "seed-efg",
      };
      const rate = 1.0;
      const applicableInterceptors = [{ name: "testInterceptor" }];
      processBetQueue.executeInterceptorTransform = jest
        .fn()
        .mockImplementation((event, interceptors, data) => data.betRecord);

      // Act
      await processBetQueue.upsertBet(
        player,
        roundId,
        bet,
        rate,
        applicableInterceptors,
      );

      // Assert
      expect(processBetQueue.executeInterceptorTransform).toHaveBeenCalledWith(
        "enhanceBetRecord",
        applicableInterceptors,
        expect.objectContaining({
          betRecord: expect.any(Object),
          bet,
        }),
      );
    });

    test("should not call executeInterceptorTransform when interceptors are null", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const bet = {
        betChoice: "move",
        amount: 100,
        clientSeed: "seed-hij",
      };
      const rate = 1.0;
      processBetQueue.executeInterceptorTransform = jest.fn();

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      expect(
        processBetQueue.executeInterceptorTransform,
      ).not.toHaveBeenCalled();
    });

    test("should use transformed bet record when interceptor returns modified data", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const bet = {
        betChoice: "kick",
        amount: 100,
        clientSeed: "seed-klm",
      };
      const rate = 1.0;
      const applicableInterceptors = [{ name: "testInterceptor" }];
      const enhancedData = { customField: "customValue" };
      processBetQueue.executeInterceptorTransform = jest
        .fn()
        .mockImplementation((event, interceptors, data) => ({
          ...data.betRecord,
          ...enhancedData,
        }));

      // Act
      await processBetQueue.upsertBet(
        player,
        roundId,
        bet,
        rate,
        applicableInterceptors,
      );

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const setOnInsertData = callArgs[1].$setOnInsert;
      expect(setOnInsertData.customField).toBe(enhancedData.customField);
    });

    test("should handle multiple different bet choices in increment", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const testCases = [
        { betChoice: "big", amount: 100 },
        { betChoice: "small", amount: 50 },
        { betChoice: "odd", amount: 75 },
        { betChoice: "even", amount: 125 },
      ];

      for (const testCase of testCases) {
        // Reset mock
        mockDeps.betsRepository.updateOne.mockClear();

        // Act
        await processBetQueue.upsertBet(
          player,
          roundId,
          { ...testCase, clientSeed: "seed" },
          1.0,
          null,
        );

        // Assert
        const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
        const incrementData = callArgs[1].$inc;
        expect(incrementData[testCase.betChoice]).toBe(testCase.amount);
      }
    });

    test("should use correct rate in bet record when rate differs from 1.0", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const bet = {
        betChoice: "noStable",
        amount: 100,
        clientSeed: "seed-nop",
      };
      const rate = 2.5;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const setOnInsertData = callArgs[1].$setOnInsert;
      expect(setOnInsertData.rate).toBe(rate);
    });

    test("should set upsert option to true", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const bet = {
        betChoice: "noKick",
        amount: 100,
        clientSeed: "seed-qrs",
      };
      const rate = 1.0;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const options = callArgs[2];
      expect(options.upsert).toBe(true);
    });

    test("should set setDefaultsOnInsert option to true", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const bet = {
        betChoice: "noMove",
        amount: 100,
        clientSeed: "seed-tuv",
      };
      const rate = 1.0;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const options = callArgs[2];
      expect(options.setDefaultsOnInsert).toBe(true);
    });
  });

  describe("Integration scenarios", () => {
    test("should handle complete bet placement workflow", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const bet = {
        betChoice: "noRelease",
        amount: 100,
        clientSeed: "seed-integration",
      };
      const rate = 1.0;

      // Act
      const betTime = await processBetQueue.upsertBet(
        player,
        roundId,
        bet,
        rate,
        null,
      );

      // Assert
      expect(mockDeps.betsRepository.updateOne).toHaveBeenCalledTimes(1);
      expect(betTime).toBeDefined();
      expect(betTime instanceof Date).toBe(true);

      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      expect(callArgs[0]).toEqual({ uid: player.UID, roundId });
      expect(callArgs[1].$inc).toEqual({
        [bet.betChoice]: bet.amount,
        totalAmount: bet.amount,
      });
      expect(callArgs[1].$setOnInsert.uid).toBe(player.UID);
      expect(callArgs[1].$setOnInsert.roundId).toBe(roundId);
    });

    test("should handle subsequent bets from same player in same round", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const firstBet = {
        betChoice: "big",
        amount: 100,
        clientSeed: "seed-first",
      };
      const secondBet = {
        betChoice: "big",
        amount: 50,
        clientSeed: "seed-second",
      };
      const rate = 1.0;

      // Act
      await processBetQueue.upsertBet(player, roundId, firstBet, rate, null);
      await processBetQueue.upsertBet(player, roundId, secondBet, rate, null);

      // Assert
      expect(mockDeps.betsRepository.updateOne).toHaveBeenCalledTimes(2);

      // Both calls should use same filter (uid and roundId)
      const firstCallFilter =
        mockDeps.betsRepository.updateOne.mock.calls[0][0];
      const secondCallFilter =
        mockDeps.betsRepository.updateOne.mock.calls[1][0];
      expect(firstCallFilter).toEqual(secondCallFilter);
    });

    test("should handle bets with all session fields populated", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      player.session = {
        siteId: "site-123",
        currencyName: "USD",
        operatorId: "operator-456",
        playerId: "player-789",
        system: "web",
        siteName: "TestSite",
        multiplier: 1.0,
        currencyCode: "USD",
      };
      const roundId = 12345;
      const bet = {
        betChoice: "small",
        amount: 100,
        clientSeed: "seed-session",
      };
      const rate = 1.5;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const setOnInsertData = callArgs[1].$setOnInsert;
      expect(setOnInsertData.siteId).toBe(player.session.siteId);
      expect(setOnInsertData.currency).toBe(player.session.currencyName);
      expect(setOnInsertData.rate).toBe(rate);
      expect(setOnInsertData.operatorId).toBe(player.session.operatorId);
      expect(setOnInsertData.playerId).toBe(player.session.playerId);
      expect(setOnInsertData.appType).toBe(player.session.system);
      expect(setOnInsertData.siteName).toBe(player.session.siteName);
    });
  });

  describe("Edge cases", () => {
    test("should handle zero amount bet", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const bet = {
        betChoice: "move",
        amount: 0,
        clientSeed: "seed-zero",
      };
      const rate = 1.0;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const incrementData = callArgs[1].$inc;
      expect(incrementData[bet.betChoice]).toBe(0);
      expect(incrementData.totalAmount).toBe(0);
    });

    test("should handle very large bet amount", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const bet = {
        betChoice: "kick",
        amount: 999999999,
        clientSeed: "seed-large",
      };
      const rate = 1.0;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const incrementData = callArgs[1].$inc;
      expect(incrementData[bet.betChoice]).toBe(999999999);
    });

    test("should handle empty clientSeed", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const bet = {
        betChoice: "release",
        amount: 100,
        clientSeed: "",
      };
      const rate = 1.0;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const setOnInsertData = callArgs[1].$setOnInsert;
      expect(setOnInsertData.clientSeed).toBe("");
    });

    test("should handle roundId as zero", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 0;
      const bet = {
        betChoice: "goStable",
        amount: 100,
        clientSeed: "seed-round-zero",
      };
      const rate = 1.0;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const filter = callArgs[0];
      expect(filter.roundId).toBe(0);
    });

    test("should handle negative roundId", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = -1;
      const bet = {
        betChoice: "noStable",
        amount: 100,
        clientSeed: "seed-negative-round",
      };
      const rate = 1.0;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const filter = callArgs[0];
      expect(filter.roundId).toBe(-1);
    });

    test("should handle rate as zero", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const bet = {
        betChoice: "noKick",
        amount: 100,
        clientSeed: "seed-zero-rate",
      };
      const rate = 0;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const setOnInsertData = callArgs[1].$setOnInsert;
      expect(setOnInsertData.rate).toBe(0);
    });

    test("should handle undefined player session properties gracefully", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      player.session = undefined as any;
      const roundId = 12345;
      const bet = {
        betChoice: "noMove",
        amount: 100,
        clientSeed: "seed-undefined-session",
      };
      const rate = 1.0;

      // Act
      await processBetQueue.upsertBet(player, roundId, bet, rate, null);

      // Assert
      const callArgs = mockDeps.betsRepository.updateOne.mock.calls[0];
      const setOnInsertData = callArgs[1].$setOnInsert;
      expect(setOnInsertData.siteId).toBeUndefined();
      expect(setOnInsertData.currency).toBeUndefined();
    });

    test("should handle empty array of interceptors", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const processBetQueue = new ProcessBetQueue(mockDeps);
      const player = createMockPlayer();
      const roundId = 12345;
      const bet = {
        betChoice: "noRelease",
        amount: 100,
        clientSeed: "seed-empty-interceptors",
      };
      const rate = 1.0;
      const applicableInterceptors: any[] = [];
      processBetQueue.executeInterceptorTransform = jest
        .fn()
        .mockImplementation((event, interceptors, data) => data.betRecord);

      // Act
      await processBetQueue.upsertBet(
        player,
        roundId,
        bet,
        rate,
        applicableInterceptors,
      );

      // Assert
      expect(processBetQueue.executeInterceptorTransform).toHaveBeenCalled();
      expect(mockDeps.betsRepository.updateOne).toHaveBeenCalledTimes(1);
    });
  });
});

// Helper function to create mock dependencies
function createMockDependencies() {
  const mockGameData = {
    remainingTime: 30000,
    roundId: 0,
    totalBets: {},
    chips: [],
    result: {
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
    },
    gameConfigs: {
      gameId: 1,
      enabled: true,
      odds: { margin: 0.05 },
      originalOdds: {} as any,
      enableFreeBet: false,
      boostedChoices: false,
    },
    odds: {
      big: 1.95,
      small: 2.05,
      odd: 1.9,
      even: 1.9,
      kick: 2.5,
      move: 1.85,
      release: 2.2,
      goStable: 2.0,
      noStable: 1.8,
      noKick: 1.5,
      noMove: 2.15,
      noRelease: 1.75,
    },
  } as any;

  const mockBetsRepository = {
    updateOne: jest.fn().mockResolvedValue({ acknowledged: true }),
    create: jest.fn().mockResolvedValue({}),
    findOne: jest.fn().mockResolvedValue(null),
  } as any;

  const mockDefinition = {
    id: 1,
    name: "ludo",
    durations: {
      wholeRound: 30000,
      placingBets: 20000,
      lockingBet: 5000,
    },
  } as any;

  const mockPlaceBetPublisher = {
    publishSuccessBet: jest.fn(),
    publishGameFailedBet: jest.fn(),
    publishGeneralFailedBet: jest.fn(),
    publishToUser: jest.fn(),
    publishToAllUsers: jest.fn(),
    gameName: "ludo",
    gameData: mockGameData,
  } as any;

  const mockPlaceBet = jest.fn().mockResolvedValue({
    isOk: true,
    response: { red: 1000 },
  });

  const mockLogService = {
    logError: jest.fn(),
    logInfo: jest.fn(),
  };

  const mockBetLogsRepository = {
    create: jest.fn().mockResolvedValue({}),
  } as any;

  const mockGameManagementApiClientFactory = {
    instance: jest.fn().mockReturnValue({
      users: {
        updateUserStakeLevel: jest.fn().mockResolvedValue({}),
      },
    }),
    gameManagementApiSettings: {} as any,
    apiClient: {} as any,
  } as any;

  const mockBaseMetrics = {
    collectBetProcessedTime: jest.fn(),
    appConfigs: {} as any,
    socketIOMetrics: {} as any,
    metricsEnabled: true,
    init: jest.fn(),
  } as any;

  return {
    definition: mockDefinition,
    gameData: mockGameData,
    placeBetPublisher: mockPlaceBetPublisher,
    placeBet: mockPlaceBet,
    logService: mockLogService,
    betsRepository: mockBetsRepository,
    betLogsRepository: mockBetLogsRepository,
    gameManagementApiClientFactory: mockGameManagementApiClientFactory,
    baseMetrics: mockBaseMetrics,
    betEventInterceptors: [],
  };
}

// Helper function to create mock player
function createMockPlayer() {
  return {
    UID: "test-user-123",
    profile: {
      name: "TestPlayer",
      minBet: 10,
      maxBet: 1000,
    },
    session: {
      siteId: "site-1",
      currencyName: "USD",
      operatorId: "operator-1",
      playerId: "player-1",
      system: "web",
      siteName: "TestSite",
      multiplier: 1.0,
      currencyCode: "USD",
    },
  };
}
