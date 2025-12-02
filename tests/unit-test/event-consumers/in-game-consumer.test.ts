import { PlayerColor } from "@rd/ludo-rules";
import { InGameConsumer } from "../../../src/event-consumers/in-game-consumer.js";
import GameData from "../../../src/game-data.js";
import GameDefinition from "../../../src/game-definition.js";
import { RoundQuery } from "../../../src/query-apis/round-query.js";
import { RealPlayer } from "../../../src/types.js";

// Mock sc-game-base to avoid constructor issues
jest.mock("sc-game-base", () => {
  const mockBaseClass = class MockTableInGameConsumer {
    constructor() {}
    getUserInfo = jest.fn();
    buildPlayersPayload = jest.fn();
    trackUserSignIn = jest.fn();
    consume = jest.fn();
  };

  return {
    Table: {
      EventConsumers: {
        TableInGameConsumer: mockBaseClass,
      },
      TableGameData: class MockTableGameData {
        remainingTime: number;
        roundId: number;
        totalBets: any;
        chips: any;
        constructor(remainingTime: number) {
          this.remainingTime = remainingTime;
          this.roundId = 0;
          this.totalBets = {};
          this.chips = [];
        }
      },
    },
    Systems: {
      Mobi: 1,
      Mini: 2,
      Web: 3,
    },
  };
});

jest.mock("sc-game-base/dist/constants/systems.js", () => ({
  Systems: {
    Mobi: 1,
    Mini: 2,
    Web: 3,
  },
}));

// Mock dependencies
jest.mock("../../../src/helpers/rule-bot-instance.js", () => ({
  ruleBotInstance: {
    move: jest.fn(),
  },
}));

const mockBoardState = {
  0: [0, 0, 0, 0],
  1: [0, 0, 0, 0],
  2: [0, 0, 0, 0],
  3: [0, 0, 0, 0],
};

jest.mock("@rd/ludo-rules", () => ({
  PlayerColor: {
    RED: "red",
    GREEN: "green",
    YELLOW: "yellow",
    BLUE: "blue",
  },
  getAllActionByBot: jest.fn().mockResolvedValue({
    "0-1": { oldPosition: 0, newPosition: 1 },
    "5-10": { oldPosition: 5, newPosition: 10 },
  }),
  convertBoardState: jest.fn().mockReturnValue({
    0: [0, 0, 0, 0],
    1: [0, 0, 0, 0],
    2: [0, 0, 0, 0],
    3: [0, 0, 0, 0],
  }),
}));

describe("InGameConsumer", () => {
  describe("Class definition", () => {
    test("should be defined", () => {
      // Arrange & Act & Assert
      expect(InGameConsumer).toBeDefined();
    });

    test("should extend from base class with required methods", () => {
      // Arrange & Act
      const hasRequiredMethods =
        InGameConsumer.prototype.buildPayload !== undefined &&
        InGameConsumer.prototype.generateGameState !== undefined;

      // Assert
      expect(hasRequiredMethods).toBe(true);
      expect(InGameConsumer.prototype.buildPayload).toBeDefined();
      expect(InGameConsumer.prototype.generateGameState).toBeDefined();
    });
  });

  describe("Method signatures", () => {
    test("buildPayload should be an async function", () => {
      // Arrange
      const method = InGameConsumer.prototype.buildPayload;

      // Act
      const isAsync = method.constructor.name === "AsyncFunction";

      // Assert
      expect(method).toBeDefined();
      expect(isAsync).toBe(true);
    });

    test("generateRoundData should be an async function", () => {
      // Arrange
      const method = InGameConsumer.prototype.generateGameState;

      // Act
      const isAsync = method.constructor.name === "AsyncFunction";

      // Assert
      expect(method).toBeDefined();
      expect(isAsync).toBe(true);
    });
  });

  describe("generateRoundData", () => {
    let consumer: InGameConsumer;
    let mockGameData: GameData;

    beforeEach(() => {
      // Arrange - Create fresh instances for each test
      consumer = Object.create(InGameConsumer.prototype);
      mockGameData = new GameData(30000);
      mockGameData.result = {
        board: {
          [PlayerColor.RED]: [0, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [5, 10, 0, 0],
        },
        nextTurnIndex: 0,
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        winners: [],
        dice: [3, 4],
        action: {
          oldPosition: 0,
          newPosition: 7,
          playerColor: PlayerColor.RED,
        },
      };
      mockGameData.roundId = 5;
      mockGameData.initRoundId = 1;
      consumer.gameData = mockGameData;
      consumer.definition = { durations: { placingBets: 17 } } as any;
    });

    test("should generate round data with board state and current turn count", async () => {
      // Act
      const roundData = await consumer.generateGameState();

      // Assert
      expect(roundData).toBeDefined();
      expect(roundData.board).toEqual(mockBoardState);
      expect(roundData.currentTurnCount).toBe(4); // roundId (5) - initRoundId (1) = 4
    });

    test("should include next player color based on turn index", async () => {
      // Act
      const roundData = await consumer.generateGameState();

      // Assert
      expect(roundData.nextPlayer).toBe(PlayerColor.RED);
    });

    test("should include possible actions from bot calculation", async () => {
      // Act
      const roundData = await consumer.generateGameState();

      // Assert
      expect(roundData.possibleActions).toBeDefined();
      expect(Array.isArray(roundData.possibleActions)).toBe(true);
      expect(roundData.possibleActions).toEqual([
        { oldPosition: 0, newPosition: 1 },
        { oldPosition: 5, newPosition: 10 },
      ]);
    });

    test("should calculate next player color for different turn indices", async () => {
      // Arrange
      mockGameData.remainingTime = 16;
      mockGameData.result.nextTurnIndex = 2;

      // Act
      const roundData = await consumer.generateGameState();

      // Assert
      expect(roundData.nextPlayer).toBe(PlayerColor.YELLOW);
    });

    test("should calculate return next player color when remaining time is less than placing bets duration", async () => {
      // Arrange
      mockGameData.remainingTime = 28;
      mockGameData.result.action.playerColor = PlayerColor.YELLOW;

      // Act
      const roundData = await consumer.generateGameState();

      // Assert
      expect(roundData.nextPlayer).toBe(PlayerColor.YELLOW);
    });
  });

  describe("buildPayload", () => {
    let consumer: InGameConsumer;
    let mockGameData: GameData;
    let mockDefinition: GameDefinition;
    let mockRoundQuery: RoundQuery;
    let mockRealPlayer: RealPlayer;

    beforeEach(() => {
      // Arrange - Set up all mocks
      consumer = Object.create(InGameConsumer.prototype);
      mockGameData = new GameData(30000);
      mockGameData.roundId = 10;
      mockGameData.gameConfigs = {
        gameId: 1,
        enabled: true,
        odds: { margin: 0.05 },
        originalOdds: {} as any,
        enableFreeBet: false,
        boostedChoices: false,
      };
      mockGameData.totalBets = { big: 100, small: 200 } as any;
      mockGameData.exchangeRates = {
        exId: 1,
        code: { USD: 1, EUR: 0.85 },
      };
      mockGameData.currencyGroupGames = [
        { groupId: 1, name: "Group 1" },
      ] as any;
      mockGameData.odds = {} as any;
      mockGameData.chips = [10, 50, 100] as any;
      mockGameData.remainingTime = 25000;
      mockGameData.ingame = {
        testPlayer: {
          ownBets: { big: 50, small: 30 },
          clientSeed: "seed123",
        },
      };
      mockGameData.result = {
        board: {
          [PlayerColor.RED]: [0, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 0,
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        winners: [],
        dice: [],
        action: {
          oldPosition: 0,
          newPosition: 0,
          playerColor: PlayerColor.RED,
        },
      };

      mockDefinition = { numberOfRoundHistory: 10 } as any;
      mockRoundQuery = {
        getList: jest.fn().mockResolvedValue([
          { id: 1, result: { dice1: 3, dice2: 4 } },
          { id: 2, result: { dice1: 5, dice2: 2 } },
        ]),
      } as any;

      mockRealPlayer = {
        profile: { name: "testPlayer" },
        session: {
          currencyCode: "USD",
          multiplier: 1,
          currencyGroupId: "1",
          system: "Web",
        },
      } as any;

      consumer.gameData = mockGameData;
      consumer.definition = mockDefinition;
      consumer.roundQuery = mockRoundQuery;
      consumer.getUserInfo = jest.fn().mockResolvedValue({
        userId: 123,
        username: "testPlayer",
        balance: 1000,
      });
      consumer.buildPlayersPayload = jest.fn().mockReturnValue({});
      consumer.generateGameState = jest.fn().mockResolvedValue({
        board: mockGameData.result.board,
        currentTurnCount: 5,
        action: mockGameData.result.action,
        nextPlayerColor: PlayerColor.RED,
        possibleActions: [],
      });
    });

    test("should build complete payload with all required fields", async () => {
      // Act
      const payload = await consumer.buildPayload(mockRealPlayer);

      // Assert
      expect(payload).toBeDefined();
      expect(payload.roundId).toBe(10);
      expect(payload.gameConfigs).toBeDefined();
      expect(payload.roundHistory).toBeDefined();
      expect(payload.ownBets).toEqual({ big: 50, small: 30 });
      expect(payload.gameState).toBeDefined();
      expect(payload.totalBets).toBeDefined();
      expect(payload.user).toBeDefined();
    });

    test("should call getUserInfo with correct parameters", async () => {
      // Act
      await consumer.buildPayload(mockRealPlayer);

      // Assert
      expect(consumer.getUserInfo).toHaveBeenCalledWith(mockRealPlayer);
      expect(consumer.getUserInfo).toHaveBeenCalledTimes(1);
    });

    test("should fetch round history with correct limit", async () => {
      // Act
      await consumer.buildPayload(mockRealPlayer);

      // Assert
      expect(mockRoundQuery.getList).toHaveBeenCalledWith(10, {
        id: 1,
        result: {
          dice1: { $arrayElemAt: ["$result.dice", 0] },
          dice2: { $arrayElemAt: ["$result.dice", 1] },
        },
      });
    });

    test("should calculate user rate correctly", async () => {
      // Act
      const payload = await consumer.buildPayload(mockRealPlayer);

      // Assert
      expect(payload.user.rate).toBe(1); // USD rate (1) * multiplier (1)
    });

    test("should handle different currency rates", async () => {
      // Arrange
      mockRealPlayer.session.currencyCode = "EUR";

      // Act
      const payload = await consumer.buildPayload(mockRealPlayer);

      // Assert
      expect(payload.user.rate).toBe(0.85);
    });

    test("should include promotion when available and no promotionTOProgress", async () => {
      // Arrange
      mockRealPlayer.promotion = {
        promotionId: "promo123",
        promotionName: "Test Promo",
      };

      // Act
      const payload = await consumer.buildPayload(mockRealPlayer);

      // Assert
      expect(payload.promotion).toEqual(mockRealPlayer.promotion);
    });

    test("should include promotionTOProgress when available", async () => {
      // Arrange
      mockRealPlayer.promotionTOProgress = {
        totalTurnover: 500,
        minRequiredTurnover: 1000,
        remainingTO: 500,
        progressPercentage: 50,
        canClaim: false,
        totalWinAmount: 100,
        claimExpirationDate: new Date("2025-12-31"),
      };
      mockRealPlayer.promotion = {
        promotionId: "promo123",
        promotionName: "Test Promo",
      };

      // Act
      const payload = await consumer.buildPayload(mockRealPlayer);

      // Assert
      expect(payload.promotionTOProgress).toBeDefined();
      expect(payload.promotionTOProgress.totalTO).toBe(500);
      expect(payload.promotionTOProgress.progress).toBe(50);
      expect(payload.promotionTOProgress.promotionId).toBe("promo123");
    });

    test("should handle empty ownBets when player not in ingame", async () => {
      // Arrange
      mockRealPlayer.profile.name = "newPlayer";

      // Act
      const payload = await consumer.buildPayload(mockRealPlayer);

      // Assert
      expect(payload.ownBets).toEqual({});
    });

    test("should return empty players object when system is Mobi", async () => {
      // Arrange
      const { Systems } = await import("sc-game-base/dist/constants/systems.js");
      mockRealPlayer.session.system = Systems.Mobi;
      consumer.buildPlayersPayload = jest.fn().mockReturnValue({ player1: {} });

      // Act
      const payload = await consumer.buildPayload(mockRealPlayer);

      // Assert
      expect(payload.players).toEqual({});
      expect(consumer.buildPlayersPayload).not.toHaveBeenCalled();
    });

    test("should return payload without remainingTime when disabled and system is Mini", async () => {
      // Arrange
      const { Systems } = await import("sc-game-base/dist/constants/systems.js");
      mockGameData.gameConfigs = {
        gameId: 1,
        enabled: false,
        odds: { margin: 0.05 },
        originalOdds: {} as any,
        enableFreeBet: false,
        boostedChoices: false,
      };
      mockRealPlayer.session.system = Systems.Mini;
      consumer.buildPlayersPayload = jest.fn().mockReturnValue({ player1: {} });

      // Act
      const payload = await consumer.buildPayload(mockRealPlayer);

      // Assert
      expect(payload.remainingTime).toBeUndefined();
      expect(payload.players).toBeDefined();
      expect(payload.chips).toBeDefined();
    });

    test("should return payload with remainingTime when not disabled or system is not Mini", async () => {
      // Arrange
      const { Systems } = await import("sc-game-base/dist/constants/systems.js");
      mockRealPlayer.session.system = Systems.Web;
      consumer.buildPlayersPayload = jest.fn().mockReturnValue({ player1: {} });

      // Act
      const payload = await consumer.buildPayload(mockRealPlayer);

      // Assert
      expect(payload.remainingTime).toBe(25000);
      expect(payload.players).toBeDefined();
      expect(payload.chips).toBeDefined();
    });

    test("should return payload with remainingTime when disabled but system is not Mini", async () => {
      // Arrange
      const { Systems } = await import("sc-game-base/dist/constants/systems.js");
      mockGameData.gameConfigs = {
        gameId: 1,
        enabled: false,
        odds: { margin: 0.05 },
        originalOdds: {} as any,
        enableFreeBet: false,
        boostedChoices: false,
      };
      mockRealPlayer.session.system = Systems.Web;
      consumer.buildPlayersPayload = jest.fn().mockReturnValue({ player1: {} });

      // Act
      const payload = await consumer.buildPayload(mockRealPlayer);

      // Assert
      expect(payload.remainingTime).toBe(25000);
      expect(payload.players).toBeDefined();
      expect(payload.chips).toBeDefined();
    });
  });

  describe("consume", () => {
    let consumer: InGameConsumer;
    let mockGameData: GameData;

    beforeEach(async () => {
      consumer = Object.create(InGameConsumer.prototype);
      const { Table } = await import("sc-game-base");
      const mockBaseInstance = new Table.EventConsumers.TableInGameConsumer();
      Object.setPrototypeOf(Object.getPrototypeOf(consumer), mockBaseInstance);

      mockGameData = new GameData(30000);
      mockGameData.gameConfigs = {
        gameId: 1,
        enabled: true,
        odds: { margin: 0.05 },
        originalOdds: {} as any,
        enableFreeBet: false,
        boostedChoices: false,
      };
    });
    test("should set sendedInGame to true when player is in ingame", async () => {
      // Arrange
      const mockRealPlayer = {
        profile: { name: "testPlayer" },
        socketClient: { id: "socket123" },
      } as any;
      consumer.gameData = mockGameData;
      mockGameData.realPlayers = {
        [mockRealPlayer.socketClient.id]: {},
      } as any;

      // Act
      await consumer.consume(mockRealPlayer);

      // Assert
      expect(
        mockGameData.realPlayers[mockRealPlayer.socketClient.id].sendedInGame,
      ).toBe(true);
    });

    test("should not set sendedInGame to true when game is disabled", async () => {
      // Arrange
      const mockRealPlayer = {
        profile: { name: "testPlayer" },
        socketClient: { id: "socket123" },
      } as any;
      mockGameData.gameConfigs = {
        gameId: 1,
        enabled: false,
        odds: {} as any,
        originalOdds: {} as any,
        enableFreeBet: false,
        boostedChoices: false,
      };
      consumer.gameData = mockGameData;
      mockGameData.realPlayers = {
        [mockRealPlayer.socketClient.id]: {},
      } as any;

      // Act
      await consumer.consume(mockRealPlayer);

      // Assert
      expect(
        mockGameData.realPlayers[mockRealPlayer.socketClient.id].sendedInGame,
      ).toBe(undefined);
    });

    test("should not set sendedInGame to true when game configs is not defined", async () => {
      // Arrange
      const mockRealPlayer = {
        profile: { name: "testPlayer" },
        socketClient: { id: "socket123" },
      } as any;
      mockGameData.gameConfigs = undefined as any;
      consumer.gameData = mockGameData;
      mockGameData.realPlayers = {
        [mockRealPlayer.socketClient.id]: {},
      } as any;

      // Act
      await consumer.consume(mockRealPlayer);

      // Assert
      expect(
        mockGameData.realPlayers[mockRealPlayer.socketClient.id].sendedInGame,
      ).toBe(undefined);
    });
  });
});
