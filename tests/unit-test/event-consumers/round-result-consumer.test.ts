import { PlayerColor } from "@rd/ludo-rules";
import { RoundResultConsumer } from "../../../src/event-consumers/index.js";
import GameData from "../../../src/game-data.js";
import GameDefinition from "../../../src/game-definition.js";
import { generateSettlementResult } from "../../../src/helpers/generate-settlement-result.js";
import { generateDice } from "../../../src/helpers/index.js";
import { IResult } from "../../../src/models/interfaces/result.js";

jest.mock("sc-game-base", () => {
  const mockRoundResultConsumer = class MockRoundResultConsumer {
    gameData: any;
    definition: any;
    roundsRepository: any;
    roundResultPublisher: any;
    betsRepository: any;
    resultsRepository: any;
    provablyFairConsumer: any;
    constructor(
      gameData: any,
      definition: any,
      roundResultPublisher: any,
      resultsRepository: any,
      provablyFairConsumer: any,
    ) {
      this.gameData = gameData;
      this.definition = definition;
      this.roundResultPublisher = roundResultPublisher;
      this.resultsRepository = resultsRepository;
      this.provablyFairConsumer = provablyFairConsumer;
    }
  };

  jest.mock("../../../src/helpers/index.js", () => {
    return {
      generateDice: jest.fn(),
    };
  });

  const mockTableInGameConsumer = class MockTableInGameConsumer {
    constructor() {}
    getUserInfo = jest.fn();
    buildPlayersPayload = jest.fn();
    trackUserSignIn = jest.fn();
  };

  const mockTableSettleGameRoundConsumer = class MockTableSettleGameRoundConsumer {
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
  const mockPlaceBetConsumer = class MockPlaceBetConsumer {
    constructor() {}
    placeBet = jest.fn();
  };

  return {
    Core: {
      BaseEventConsumers: {
        RoundResultConsumer: mockRoundResultConsumer,
        PlaceBetConsumer: mockPlaceBetConsumer,
      },
    },
    Table: {
      EventConsumers: {
        TableInGameConsumer: mockTableInGameConsumer,
        TableSettleGameRoundConsumer: mockTableSettleGameRoundConsumer,
      },
      TableGameData: class MockTableGameData {
        remainingTime: number;
        roundId: number;
        initRoundId: number;
        totalBets: any;
        chips: any;
        result: any;
        constructor(remainingTime: number) {
          this.remainingTime = remainingTime;
          this.roundId = 0;
          this.initRoundId = 0;
          this.totalBets = {};
          this.chips = [];
          this.result = {};
        }
      },
    },
  };
});

jest.mock("../../../src/game-settings.ts", () => {
  return {
    default: {
      id: 163,
    },
  };
});

const mockGameSettings = { id: 163 };

const mockGenerateResult = jest.fn();
const mockGenerateOdds = jest.fn();

jest.mock("../../../src/game-definition.ts", () => {
  return jest.fn().mockImplementation(() => ({
    generateResult: mockGenerateResult,
    settle: jest.fn(),
    generateOdds: mockGenerateOdds,
  }));
});

describe("RoundResultConsumer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Class definition", () => {
    test("should be defined", () => {
      // Arrange & Act & Assert
      expect(RoundResultConsumer).toBeDefined();
    });

    test("should have required properties", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );

      // Act & Assert
      expect(consumer.gameData).toBeDefined();
      expect(consumer.definition).toBeDefined();
      expect(consumer.roundResultPublisher).toBeDefined();
      expect(consumer.resultsRepository).toBeDefined();
      expect(consumer.provablyFairConsumer).toBeDefined();
    });

    test("should have required methods", () => {
      // Arrange & Act
      const hasRequiredMethods =
        RoundResultConsumer.prototype.generateResult !== undefined &&
        RoundResultConsumer.prototype.getDataForGenerateResult !== undefined;

      // Assert
      expect(hasRequiredMethods).toBe(true);
      expect(RoundResultConsumer.prototype.generateResult).toBeDefined();
      expect(
        RoundResultConsumer.prototype.getDataForGenerateResult,
      ).toBeDefined();
    });
  });

  describe("Constructor", () => {
    test("should initialize with provided dependencies", () => {
      // Arrange
      const mockDeps = createMockDependencies();

      // Act
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );

      // Assert
      expect(consumer.gameData).toBe(mockDeps.gameData);
      expect(consumer.definition).toBe(mockDeps.definition);
      expect(consumer.roundResultPublisher).toBe(mockDeps.roundResultPublisher);
      expect(consumer.resultsRepository).toBe(mockDeps.resultsRepository);
      expect(consumer.provablyFairConsumer).toBe(mockDeps.provablyFairConsumer);
    });
  });

  describe("Method signatures", () => {
    test("generateResult should be an async function", () => {
      // Arrange
      const method = RoundResultConsumer.prototype.generateResult;

      // Act
      const isAsync = method.constructor.name === "AsyncFunction";

      // Assert
      expect(method).toBeDefined();
      expect(isAsync).toBe(true);
    });

    test("getDataForGenerateResult should be a regular function", () => {
      // Arrange
      const method = RoundResultConsumer.prototype.getDataForGenerateResult;

      // Act
      const isAsync = method.constructor.name === "AsyncFunction";

      // Assert
      expect(method).toBeDefined();
      expect(isAsync).toBe(false);
    });
  });

  describe("getDataForGenerateResult", () => {
    test("should extract current board state from gameData.result", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.result.board = {
        [PlayerColor.RED]: [5, 10, 15, 20],
        [PlayerColor.GREEN]: [0, 5, 10, 0],
        [PlayerColor.YELLOW]: [0, 0, 0, 0],
        [PlayerColor.BLUE]: [15, 20, 0, 0],
      };

      // Act
      const data = consumer.getDataForGenerateResult();

      // Assert
      expect(data.currentBoardState).toEqual({
        [PlayerColor.RED]: [5, 10, 15, 20],
        [PlayerColor.GREEN]: [0, 5, 10, 0],
        [PlayerColor.YELLOW]: [0, 0, 0, 0],
        [PlayerColor.BLUE]: [15, 20, 0, 0],
      });
    });

    test("should extract current turn index from gameData.result", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.result.nextTurnIndex = 2;

      // Act
      const data = consumer.getDataForGenerateResult();

      // Assert
      expect(data.currentTurnIndex).toBe(2);
    });

    test("should extract current players from gameData.result", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.result.currentPlayers = [
        PlayerColor.RED,
        PlayerColor.GREEN,
        PlayerColor.YELLOW,
      ];

      // Act
      const data = consumer.getDataForGenerateResult();

      // Assert
      expect(data.currentPlayers).toEqual([
        PlayerColor.RED,
        PlayerColor.GREEN,
        PlayerColor.YELLOW,
      ]);
    });

    test("should extract winners from gameData.result", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.result.winners = [PlayerColor.RED, PlayerColor.BLUE];

      // Act
      const data = consumer.getDataForGenerateResult();

      // Assert
      expect(data.winners).toEqual([PlayerColor.RED, PlayerColor.BLUE]);
    });

    test("should return object with all required properties", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.result = {
        board: {
          [PlayerColor.RED]: [10, 20, 30, 40],
          [PlayerColor.GREEN]: [5, 10, 15, 20],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 1,
        currentPlayers: [PlayerColor.RED, PlayerColor.GREEN],
        winners: [PlayerColor.RED],
        dice: [6, 4],
        action: {
          oldPosition: 30,
          newPosition: 40,
          playerColor: PlayerColor.RED,
        },
      };

      // Act
      const data = consumer.getDataForGenerateResult();

      // Assert
      expect(data).toHaveProperty("currentBoardState");
      expect(data).toHaveProperty("currentTurnIndex");
      expect(data).toHaveProperty("currentPlayers");
      expect(data).toHaveProperty("winners");
      expect(data).toHaveProperty("dice");
      expect(Object.keys(data)).toHaveLength(5);
    });

    test("should handle empty winners array", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.result.winners = [];

      // Act
      const data = consumer.getDataForGenerateResult();

      // Assert
      expect(data.winners).toEqual([]);
    });

    test("should handle all players in currentPlayers", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.result.currentPlayers = [
        PlayerColor.RED,
        PlayerColor.GREEN,
        PlayerColor.YELLOW,
        PlayerColor.BLUE,
      ];

      // Act
      const data = consumer.getDataForGenerateResult();

      // Assert
      expect(data.currentPlayers).toHaveLength(4);
      expect(data.currentPlayers).toContain(PlayerColor.RED);
      expect(data.currentPlayers).toContain(PlayerColor.GREEN);
      expect(data.currentPlayers).toContain(PlayerColor.YELLOW);
      expect(data.currentPlayers).toContain(PlayerColor.BLUE);
    });

    test("should handle initial board state with all zeros", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.result.board = {
        [PlayerColor.RED]: [0, 0, 0, 0],
        [PlayerColor.GREEN]: [0, 0, 0, 0],
        [PlayerColor.YELLOW]: [0, 0, 0, 0],
        [PlayerColor.BLUE]: [0, 0, 0, 0],
      };

      // Act
      const data = consumer.getDataForGenerateResult();

      // Assert
      expect(data.currentBoardState).toEqual({
        [PlayerColor.RED]: [0, 0, 0, 0],
        [PlayerColor.GREEN]: [0, 0, 0, 0],
        [PlayerColor.YELLOW]: [0, 0, 0, 0],
        [PlayerColor.BLUE]: [0, 0, 0, 0],
      });
    });
  });

  describe("generateResult", () => {
    test("should call getDataForGenerateResult", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [7, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 1,
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
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );
      const getDataSpy = jest.spyOn(consumer, "getDataForGenerateResult");

      // Act
      await consumer.generateResult();

      // Assert
      expect(getDataSpy).toHaveBeenCalledTimes(1);
    });

    test("should call definition.generateResult with data from getDataForGenerateResult", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      const initialBoardState = {
        [PlayerColor.RED]: [5, 10, 0, 0],
        [PlayerColor.GREEN]: [0, 0, 0, 0],
        [PlayerColor.YELLOW]: [0, 0, 0, 0],
        [PlayerColor.BLUE]: [0, 0, 0, 0],
      };
      consumer.gameData.result = {
        board: initialBoardState,
        nextTurnIndex: 1,
        currentPlayers: [PlayerColor.RED, PlayerColor.GREEN],
        winners: [],
        dice: [5, 5],
        action: {
          oldPosition: 5,
          newPosition: 15,
          playerColor: PlayerColor.RED,
        },
      };
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [5, 15, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 2,
        currentPlayers: [PlayerColor.RED, PlayerColor.GREEN],
        winners: [],
        dice: [4, 3],
        action: {
          oldPosition: 5,
          newPosition: 12,
          playerColor: PlayerColor.GREEN,
        },
      };
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );
      (generateDice as jest.Mock).mockReturnValue([5, 5]);

      // Act
      await consumer.generateResult();

      // Assert
      expect(mockDeps.definition.generateResult).toHaveBeenCalledWith({
        currentBoardState: initialBoardState,
        currentTurnIndex: 1,
        currentPlayers: [PlayerColor.RED, PlayerColor.GREEN],
        winners: [],
        dice: [5, 5],
      });
    });

    test("should update gameData.result with generated result", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [10, 20, 30, 0],
          [PlayerColor.GREEN]: [5, 10, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 2,
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        winners: [],
        dice: [6, 5],
        action: {
          oldPosition: 20,
          newPosition: 31,
          playerColor: PlayerColor.RED,
        },
      };
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );

      // Act
      await consumer.generateResult();

      // Assert
      expect(consumer.gameData.result).toEqual(mockResult);
    });

    test("should handle result with winners", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [57, 57, 57, 57],
          [PlayerColor.GREEN]: [10, 15, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 0,
        currentPlayers: [PlayerColor.RED, PlayerColor.GREEN],
        winners: [PlayerColor.RED],
        dice: [6, 6],
        action: {
          oldPosition: 51,
          newPosition: 57,
          playerColor: PlayerColor.RED,
        },
      };
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );

      // Act
      await consumer.generateResult();

      // Assert
      expect(consumer.gameData.result.winners).toEqual([PlayerColor.RED]);
    });

    test("should handle result with multiple winners", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [57, 57, 57, 57],
          [PlayerColor.GREEN]: [57, 57, 57, 57],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 0,
        currentPlayers: [PlayerColor.RED, PlayerColor.GREEN],
        winners: [PlayerColor.RED, PlayerColor.GREEN],
        dice: [6, 6],
        action: {
          oldPosition: 51,
          newPosition: 57,
          playerColor: PlayerColor.GREEN,
        },
      };
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );

      // Act
      await consumer.generateResult();

      // Assert
      expect(consumer.gameData.result.winners).toEqual([
        PlayerColor.RED,
        PlayerColor.GREEN,
      ]);
    });

    test("should update nextTurnIndex correctly", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.result.nextTurnIndex = 0;
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [7, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 1,
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
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );

      // Act
      await consumer.generateResult();

      // Assert
      expect(consumer.gameData.result.nextTurnIndex).toBe(1);
    });

    test("should preserve dice values in result", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [12, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 1,
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        winners: [],
        dice: [6, 6],
        action: {
          oldPosition: 0,
          newPosition: 12,
          playerColor: PlayerColor.RED,
        },
      };
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );

      // Act
      await consumer.generateResult();

      // Assert
      expect(consumer.gameData.result.dice).toEqual([6, 6]);
    });

    test("should preserve action data in result", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [25, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 1,
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        winners: [],
        dice: [5, 4],
        action: {
          oldPosition: 16,
          newPosition: 25,
          playerColor: PlayerColor.RED,
        },
      };
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );

      // Act
      await consumer.generateResult();

      // Assert
      expect(consumer.gameData.result.action).toEqual({
        oldPosition: 16,
        newPosition: 25,
        playerColor: PlayerColor.RED,
      });
    });

    test("should handle error from definition.generateResult", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      (mockDeps.definition.generateResult as jest.Mock).mockRejectedValue(
        new Error("Generate result failed"),
      );

      // Act & Assert
      await expect(consumer.generateResult()).rejects.toThrow(
        "Generate result failed",
      );
    });
  });

  describe("Integration scenarios", () => {
    test("should handle complete flow from initial state to result generation", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.result = {
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
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [7, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 1,
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
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );
      (generateDice as jest.Mock).mockReturnValue([3, 4]);
      // Act
      await consumer.generateResult();

      // Assert
      expect(consumer.gameData.result).toEqual(mockResult);
      expect(mockDeps.definition.generateResult).toHaveBeenCalledWith({
        currentBoardState: {
          [PlayerColor.RED]: [0, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        currentTurnIndex: 0,
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        winners: [],
        dice: [3, 4],
      });
    });

    test("should handle mid-game state progression", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.result = {
        board: {
          [PlayerColor.RED]: [10, 20, 0, 0],
          [PlayerColor.GREEN]: [5, 10, 15, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [25, 0, 0, 0],
        },
        nextTurnIndex: 2,
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        winners: [],
        dice: [5, 2],
        action: {
          oldPosition: 15,
          newPosition: 22,
          playerColor: PlayerColor.GREEN,
        },
      };
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [10, 20, 0, 0],
          [PlayerColor.GREEN]: [5, 10, 15, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [25, 30, 0, 0],
        },
        nextTurnIndex: 0,
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        winners: [],
        dice: [2, 3],
        action: {
          oldPosition: 25,
          newPosition: 30,
          playerColor: PlayerColor.BLUE,
        },
      };
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );

      // Act
      await consumer.generateResult();

      // Assert
      expect(consumer.gameData.result.board[PlayerColor.BLUE]).toEqual([
        25, 30, 0, 0,
      ]);
      expect(consumer.gameData.result.nextTurnIndex).toBe(0);
    });

    test("should handle game completion scenario", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.result = {
        board: {
          [PlayerColor.RED]: [55, 56, 57, 57],
          [PlayerColor.GREEN]: [10, 15, 20, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [5, 0, 0, 0],
        },
        nextTurnIndex: 0,
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        winners: [],
        dice: [1, 1],
        action: {
          oldPosition: 55,
          newPosition: 57,
          playerColor: PlayerColor.RED,
        },
      };
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [57, 57, 57, 57],
          [PlayerColor.GREEN]: [10, 15, 20, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [5, 0, 0, 0],
        },
        nextTurnIndex: 0,
        currentPlayers: [
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        winners: [PlayerColor.RED],
        dice: [1, 1],
        action: {
          oldPosition: 56,
          newPosition: 57,
          playerColor: PlayerColor.RED,
        },
      };
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );

      // Act
      await consumer.generateResult();

      // Assert
      expect(consumer.gameData.result.winners).toContain(PlayerColor.RED);
      expect(consumer.gameData.result.currentPlayers).not.toContain(
        PlayerColor.RED,
      );
    });
  });

  describe("Edge cases", () => {
    test("should handle empty currentPlayers array", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.result.currentPlayers = [];
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [0, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 0,
        currentPlayers: [],
        winners: [],
        dice: [],
        action: {
          oldPosition: 0,
          newPosition: 0,
          playerColor: PlayerColor.RED,
        },
      };
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );

      // Act
      await consumer.generateResult();

      // Assert
      expect(consumer.gameData.result.currentPlayers).toEqual([]);
    });

    test("should handle very high position values", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [57, 57, 57, 57],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 0,
        currentPlayers: [PlayerColor.GREEN],
        winners: [PlayerColor.RED],
        dice: [6, 6],
        action: {
          oldPosition: 51,
          newPosition: 57,
          playerColor: PlayerColor.RED,
        },
      };
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );

      // Act
      await consumer.generateResult();

      // Assert
      expect(consumer.gameData.result.action.newPosition).toBe(57);
    });

    test("should handle same oldPosition and newPosition", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [5, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 1,
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        winners: [],
        dice: [1, 2],
        action: {
          oldPosition: 5,
          newPosition: 5,
          playerColor: PlayerColor.RED,
        },
      };
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );

      // Act
      await consumer.generateResult();

      // Assert
      expect(consumer.gameData.result.action.oldPosition).toBe(
        consumer.gameData.result.action.newPosition,
      );
    });

    test("should handle zero nextTurnIndex", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
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
          newPosition: 0,
          playerColor: PlayerColor.RED,
        },
      };
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );

      // Act
      await consumer.generateResult();

      // Assert
      expect(consumer.gameData.result.nextTurnIndex).toBe(0);
    });
  });

  describe("generateResult with currentBoardState from admin", () => {
    test("should reset initRoundId to current roundId when admin provides currentBoardState", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.roundId = 10;
      consumer.gameData.initRoundId = 5; // Previous initRoundId
      consumer.gameData.gameConfigs = {
        gameId: 163,
        enabled: true,
        odds: {
          big: 1,
          small: 1,
          odd: 1,
          even: 1,
          kick: 1,
          noKick: 1,
          move: 1,
          noMove: 1,
          release: 1,
          noRelease: 1,
          goStable: 1,
          noStable: 1,
        },
        originalOdds: {} as any,
        enableFreeBet: false,
        boostedChoices: false,
      };
      const adminBoardState = {
        [PlayerColor.RED]: [10, 20, 0, 0],
        [PlayerColor.GREEN]: [5, 0, 0, 0],
        [PlayerColor.YELLOW]: [0, 0, 0, 0],
        [PlayerColor.BLUE]: [0, 0, 0, 0],
      };
      consumer.gameData.settlementResultFromAdmin = {
        roundId: 10,
        result: {
          dice: [6, 6],
          currentBoardState: adminBoardState,
        } as any,
      };
      consumer.gameData.result = {
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
      const mockResult: IResult = {
        board: adminBoardState,
        nextTurnIndex: 1,
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        winners: [],
        dice: [6, 6],
        action: {
          oldPosition: 0,
          newPosition: 10,
          playerColor: PlayerColor.RED,
        },
      };
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );
      (mockDeps.definition.generateOdds as jest.Mock).mockResolvedValue({
        big: 2.0,
        small: 1.8,
      });

      // Act
      await consumer.generateResult();

      // Assert
      expect(consumer.gameData.initRoundId).toBe(10); // Should be reset to current roundId
    });

    test("should regenerate odds when admin provides currentBoardState", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.roundId = 10;
      consumer.gameData.initRoundId = 5;
      consumer.gameData.gameConfigs = {
        gameId: 163,
        enabled: true,
        odds: {
          big: 1,
          small: 1,
          odd: 1,
          even: 1,
          kick: 1,
          noKick: 1,
          move: 1,
          noMove: 1,
          release: 1,
          noRelease: 1,
          goStable: 1,
          noStable: 1,
        },
        originalOdds: {} as any,
        enableFreeBet: false,
        boostedChoices: false,
      };
      const adminBoardState = {
        [PlayerColor.RED]: [10, 20, 0, 0],
        [PlayerColor.GREEN]: [5, 0, 0, 0],
        [PlayerColor.YELLOW]: [0, 0, 0, 0],
        [PlayerColor.BLUE]: [0, 0, 0, 0],
      };
      const adminResult = {
        dice: [6, 6],
        currentBoardState: adminBoardState,
      };
      consumer.gameData.settlementResultFromAdmin = {
        roundId: 10,
        result: adminResult as any,
      };
      consumer.gameData.result = {
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
      const mockResult: IResult = {
        board: adminBoardState,
        nextTurnIndex: 1,
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        winners: [],
        dice: [6, 6],
        action: {
          oldPosition: 0,
          newPosition: 10,
          playerColor: PlayerColor.RED,
        },
      };
      const newOdds = {
        big: 2.0,
        small: 1.8,
        odd: 1.9,
        even: 1.9,
      };
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );
      (mockDeps.definition.generateOdds as jest.Mock).mockResolvedValue(
        newOdds,
      );

      // Act
      await consumer.generateResult();

      // Assert
      expect(mockDeps.definition.generateOdds).toHaveBeenCalledTimes(1);
      expect(mockDeps.definition.generateOdds).toHaveBeenCalledWith(
        expect.any(Object), // converted margin keys
        adminResult,
      );
      expect(consumer.gameData.odds).toEqual(newOdds);
    });

    test("should NOT reset initRoundId when admin result does not contain currentBoardState", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.roundId = 10;
      consumer.gameData.initRoundId = 5; // Should remain unchanged
      consumer.gameData.gameConfigs = {
        gameId: 163,
        enabled: true,
        odds: {
          big: 1,
          small: 1,
          odd: 1,
          even: 1,
          kick: 1,
          noKick: 1,
          move: 1,
          noMove: 1,
          release: 1,
          noRelease: 1,
          goStable: 1,
          noStable: 1,
        },
        originalOdds: {} as any,
        enableFreeBet: false,
        boostedChoices: false,
      };
      consumer.gameData.settlementResultFromAdmin = {
        roundId: 10,
        result: {
          dice: [3, 4], // Only dice, no currentBoardState
        },
      };
      consumer.gameData.result = {
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
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [7, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 1,
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
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );

      // Act
      await consumer.generateResult();

      // Assert
      expect(consumer.gameData.initRoundId).toBe(5); // Should remain unchanged
    });

    test("should NOT regenerate odds when admin result does not contain currentBoardState", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.roundId = 10;
      consumer.gameData.initRoundId = 5;
      consumer.gameData.gameConfigs = {
        gameId: 163,
        enabled: true,
        odds: {
          big: 1,
          small: 1,
          odd: 1,
          even: 1,
          kick: 1,
          noKick: 1,
          move: 1,
          noMove: 1,
          release: 1,
          noRelease: 1,
          goStable: 1,
          noStable: 1,
        },
        originalOdds: {} as any,
        enableFreeBet: false,
        boostedChoices: false,
      };
      consumer.gameData.settlementResultFromAdmin = {
        roundId: 10,
        result: {
          dice: [3, 4], // Only dice, no currentBoardState
        },
      };
      consumer.gameData.result = {
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
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [7, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 1,
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
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );

      // Act
      await consumer.generateResult();

      // Assert
      expect(mockDeps.definition.generateOdds).not.toHaveBeenCalled();
    });

    test("should NOT reset initRoundId when no admin result exists", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.roundId = 10;
      consumer.gameData.initRoundId = 5; // Should remain unchanged
      consumer.gameData.settlementResultFromAdmin = undefined as any;
      consumer.gameData.result = {
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
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [7, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 1,
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
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );

      // Act
      await consumer.generateResult();

      // Assert
      expect(consumer.gameData.initRoundId).toBe(5); // Should remain unchanged
      expect(mockDeps.definition.generateOdds).not.toHaveBeenCalled();
    });

    test("should use admin currentBoardState in generateResult call", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.roundId = 10;
      consumer.gameData.initRoundId = 5;
      consumer.gameData.gameConfigs = {
        gameId: 163,
        enabled: true,
        odds: {
          big: 1,
          small: 1,
          odd: 1,
          even: 1,
          kick: 1,
          noKick: 1,
          move: 1,
          noMove: 1,
          release: 1,
          noRelease: 1,
          goStable: 1,
          noStable: 1,
        },
        originalOdds: {} as any,
        enableFreeBet: false,
        boostedChoices: false,
      };
      const adminBoardState = {
        [PlayerColor.RED]: [30, 40, 50, 0],
        [PlayerColor.GREEN]: [15, 25, 0, 0],
        [PlayerColor.YELLOW]: [10, 0, 0, 0],
        [PlayerColor.BLUE]: [5, 0, 0, 0],
      };
      consumer.gameData.settlementResultFromAdmin = {
        roundId: 10,
        result: {
          dice: [6, 6],
          currentBoardState: adminBoardState,
          currentTurnIndex: 2,
          currentPlayers: [PlayerColor.RED, PlayerColor.GREEN],
          winners: [],
        } as any,
      };
      consumer.gameData.result = {
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
      const mockResult: IResult = {
        board: adminBoardState,
        nextTurnIndex: 3,
        currentPlayers: [PlayerColor.RED, PlayerColor.GREEN],
        winners: [],
        dice: [6, 6],
        action: {
          oldPosition: 50,
          newPosition: 57,
          playerColor: PlayerColor.RED,
        },
      };
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );
      (mockDeps.definition.generateOdds as jest.Mock).mockResolvedValue({});

      // Act
      await consumer.generateResult();

      // Assert
      expect(mockDeps.definition.generateResult).toHaveBeenCalledWith(
        expect.objectContaining({
          currentBoardState: adminBoardState,
          dice: [6, 6],
          currentTurnIndex: 2,
          currentPlayers: [PlayerColor.RED, PlayerColor.GREEN],
          winners: [],
        }),
      );
    });
  });

  describe("resultFromAdmin", () => {
    test("should return settlement result when roundId matches", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.roundId = 5;
      consumer.gameData.settlementResultFromAdmin = {
        roundId: 5,
        result: {
          dice: [6, 6],
        },
      };

      // Act
      const result = consumer.resultFromAdmin();

      // Assert
      expect(result).toEqual({
        dice: [6, 6],
      });
    });

    test("should return empty object when roundId does not match", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.roundId = 5;
      consumer.gameData.settlementResultFromAdmin = {
        roundId: 10,
        result: {
          dice: [6, 6],
        },
      };

      // Act
      const result = consumer.resultFromAdmin();

      // Assert
      expect(result).toEqual({});
    });

    test("should return empty object when settlementResultFromAdmin is undefined", () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.roundId = 5;
      consumer.gameData.settlementResultFromAdmin = undefined as any;

      // Act
      const result = consumer.resultFromAdmin();

      // Assert
      expect(result).toEqual({});
    });

    test("should merge settlement result with getDataForGenerateResult in generateResult", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundResultConsumer(
        mockDeps.gameData,
        mockDeps.definition,
        mockDeps.roundResultPublisher,
        mockDeps.resultsRepository,
        mockDeps.provablyFairConsumer,
      );
      consumer.gameData.roundId = 5;
      consumer.gameData.settlementResultFromAdmin = {
        roundId: 5,
        result: {
          dice: [6, 6],
        },
      };
      consumer.gameData.result = {
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
      const mockResult: IResult = {
        board: {
          [PlayerColor.RED]: [7, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        nextTurnIndex: 1,
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        winners: [],
        dice: [6, 6],
        action: {
          oldPosition: 0,
          newPosition: 7,
          playerColor: PlayerColor.RED,
        },
      };
      (mockDeps.definition.generateResult as jest.Mock).mockResolvedValue(
        mockResult,
      );

      // Act
      await consumer.generateResult();

      // Assert
      expect(mockDeps.definition.generateResult).toHaveBeenCalledWith(
        expect.objectContaining({
          dice: [6, 6], // Should use dice from settlementResultFromAdmin
        }),
      );
    });
  });
});

// Helper function to create mock dependencies
function createMockDependencies() {
  const mockGameData = new GameData(30000);
  mockGameData.roundId = 1;
  mockGameData.initRoundId = 1;
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

  const mockDefinition = new GameDefinition(
    mockGameSettings,
    mockGenerateResult,
    generateSettlementResult,
    undefined,
    mockGenerateOdds,
  );

  const mockRoundResultPublisher = {
    publishRoundResult: jest.fn(),
  } as any;

  const mockResultsRepository = {
    create: jest.fn(),
  } as any;

  const mockProvablyFairConsumer = {
    generateServerSeed: jest.fn(),
  } as any;

  return {
    gameData: mockGameData,
    definition: mockDefinition,
    roundResultPublisher: mockRoundResultPublisher,
    resultsRepository: mockResultsRepository,
    provablyFairConsumer: mockProvablyFairConsumer,
  };
}
