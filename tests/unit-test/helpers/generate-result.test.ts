import { PlayerColor, DiceState } from "@rd/ludo-rules";
import { generateResult } from "../../../src/helpers/generate-result.js";
import { GenerateResultData } from "../../../src/game-definition.js";
import * as rng from "sc-core-rng";

// Mock dependencies
jest.mock("sc-core-rng", () => ({
  secureRandomRange: jest.fn(),
}));

jest.mock("../../../src/helpers/rule-bot-instance.js", () => ({
  ruleBotInstance: {
    move: jest.fn(),
  },
}));

jest.mock("@rd/ludo-rules", () => {
  const actual = jest.requireActual("@rd/ludo-rules");
  return {
    ...actual,
    updateGameState: jest.fn(),
    DiceState: jest.fn(),
  };
});

import { updateGameState } from "@rd/ludo-rules";
import { ruleBotInstance } from "../../../src/helpers/rule-bot-instance.js";

describe("generateResult", () => {
  let mockSecureRandomRange: jest.MockedFunction<typeof rng.secureRandomRange>;
  let mockUpdateGameState: jest.MockedFunction<typeof updateGameState>;
  let mockRuleBotMove: jest.MockedFunction<typeof ruleBotInstance.move>;

  beforeEach(() => {
    // Arrange - Reset all mocks before each test
    jest.clearAllMocks();
    mockSecureRandomRange = rng.secureRandomRange as jest.MockedFunction<
      typeof rng.secureRandomRange
    >;
    mockUpdateGameState = updateGameState as jest.MockedFunction<
      typeof updateGameState
    >;
    mockRuleBotMove = ruleBotInstance.move as jest.MockedFunction<
      typeof ruleBotInstance.move
    >;

    // Default mock implementations
    mockSecureRandomRange.mockReturnValue(3);
    (DiceState as jest.Mock).mockImplementation((dice) => ({ dice }));
  });

  describe("Board reset on winners", () => {
    test("should reset board to initial state when there are winners", async () => {
      // Arrange
      const data: GenerateResultData = {
        currentBoardState: {
          [PlayerColor.RED]: [10, 20, 30, 40],
          [PlayerColor.GREEN]: [15, 25, 35, 45],
          [PlayerColor.YELLOW]: [12, 22, 32, 42],
          [PlayerColor.BLUE]: [18, 28, 38, 48],
        },
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        currentTurnIndex: 2,
        winners: [PlayerColor.RED],
      };

      mockUpdateGameState.mockResolvedValue({
        gameState: {
          board: {
            [PlayerColor.RED]: [0, 0, 0, 0],
            [PlayerColor.GREEN]: [0, 0, 0, 0],
            [PlayerColor.YELLOW]: [0, 0, 0, 0],
            [PlayerColor.BLUE]: [0, 0, 0, 0],
          },
          currentPlayer: PlayerColor.RED,
          playerAction: { type: "skip", oldPosition: 0, newPosition: 0 },
          winners: [],
        },
        nextTurn: 0,
      } as any);

      // Act
      const result = await generateResult(data);

      // Assert
      expect(data.currentBoardState).toEqual({
        [PlayerColor.RED]: [0, 0, 0, 0],
        [PlayerColor.GREEN]: [0, 0, 0, 0],
        [PlayerColor.YELLOW]: [0, 0, 0, 0],
        [PlayerColor.BLUE]: [0, 0, 0, 0],
      });
      expect(data.winners).toEqual([]);
    });

    test("should randomize turn index when resetting board", async () => {
      // Arrange
      mockSecureRandomRange.mockReturnValueOnce(2); // For turn index
      mockSecureRandomRange.mockReturnValue(4); // For dice

      const data: GenerateResultData = {
        currentBoardState: {
          [PlayerColor.RED]: [10, 20, 30, 40],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        currentTurnIndex: 0,
        winners: [PlayerColor.GREEN, PlayerColor.YELLOW],
      };

      mockUpdateGameState.mockResolvedValue({
        gameState: {
          board: {
            [PlayerColor.RED]: [0, 0, 0, 0],
            [PlayerColor.GREEN]: [0, 0, 0, 0],
            [PlayerColor.YELLOW]: [0, 0, 0, 0],
            [PlayerColor.BLUE]: [0, 0, 0, 0],
          },
          currentPlayer: PlayerColor.YELLOW,
          playerAction: { type: "skip", oldPosition: 0, newPosition: 0 },
          winners: [],
        },
        nextTurn: 2,
      } as any);

      // Act
      await generateResult(data);

      // Assert
      expect(mockSecureRandomRange).toHaveBeenCalledWith(0, 3);
      expect(data.currentTurnIndex).toBe(2);
    });

    test("should reset current players to all four colors", async () => {
      // Arrange
      const data: GenerateResultData = {
        currentBoardState: {
          [PlayerColor.RED]: [10, 20, 30, 40],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        currentPlayers: [PlayerColor.RED, PlayerColor.GREEN],
        currentTurnIndex: 0,
        winners: [PlayerColor.YELLOW],
      };

      mockUpdateGameState.mockResolvedValue({
        gameState: {
          board: {
            [PlayerColor.RED]: [0, 0, 0, 0],
            [PlayerColor.GREEN]: [0, 0, 0, 0],
            [PlayerColor.YELLOW]: [0, 0, 0, 0],
            [PlayerColor.BLUE]: [0, 0, 0, 0],
          },
          currentPlayer: PlayerColor.RED,
          playerAction: { type: "skip", oldPosition: 0, newPosition: 0 },
          winners: [],
        },
        nextTurn: 0,
      } as any);

      // Act
      await generateResult(data);

      // Assert
      expect(data.currentPlayers).toEqual([
        PlayerColor.RED,
        PlayerColor.GREEN,
        PlayerColor.YELLOW,
        PlayerColor.BLUE,
      ]);
    });
  });

  describe("Dice generation", () => {
    test("should generate two dice with values between 1 and 6", async () => {
      // Arrange
      mockSecureRandomRange
        .mockReturnValueOnce(3) // First die
        .mockReturnValueOnce(5); // Second die

      const data: GenerateResultData = {
        currentBoardState: {
          [PlayerColor.RED]: [0, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        currentTurnIndex: 0,
        winners: [],
      };

      mockUpdateGameState.mockResolvedValue({
        gameState: {
          board: data.currentBoardState,
          currentPlayer: PlayerColor.RED,
          playerAction: {
            type: "move",
            oldPosition: 0,
            newPosition: 8,
          },
          winners: [],
        },
        nextTurn: 1,
      } as any);

      // Act
      const result = await generateResult(data);

      // Assert
      expect(mockSecureRandomRange).toHaveBeenCalledWith(1, 6);
      expect(mockSecureRandomRange).toHaveBeenCalledTimes(2);
      expect(result.dice).toEqual([3, 5]);
    });

    test("should call secureRandomRange with correct parameters for dice", async () => {
      // Arrange
      mockSecureRandomRange.mockReturnValue(4);

      const data: GenerateResultData = {
        currentBoardState: {
          [PlayerColor.RED]: [0, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        currentPlayers: [PlayerColor.RED],
        currentTurnIndex: 0,
        winners: [],
      };

      mockUpdateGameState.mockResolvedValue({
        gameState: {
          board: data.currentBoardState,
          currentPlayer: PlayerColor.RED,
          playerAction: { type: "skip", oldPosition: 0, newPosition: 0 },
          winners: [],
        },
        nextTurn: 0,
      } as any);

      // Act
      await generateResult(data);

      // Assert
      expect(mockSecureRandomRange).toHaveBeenCalledWith(1, 6);
    });
  });

  describe("Game state update", () => {
    test("should call updateGameState with correct parameters", async () => {
      // Arrange
      mockSecureRandomRange.mockReturnValueOnce(2).mockReturnValueOnce(4);

      const data: GenerateResultData = {
        currentBoardState: {
          [PlayerColor.RED]: [5, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        currentTurnIndex: 1,
        winners: [],
      };

      mockUpdateGameState.mockResolvedValue({
        gameState: {
          board: data.currentBoardState,
          currentPlayer: PlayerColor.GREEN,
          playerAction: {
            type: "move",
            oldPosition: 0,
            newPosition: 6,
          },
          winners: [],
        },
        nextTurn: 2,
      } as any);

      // Act
      await generateResult(data);

      // Assert
      expect(mockUpdateGameState).toHaveBeenCalledWith(
        data.currentBoardState,
        data.currentPlayers,
        data.currentTurnIndex,
        expect.objectContaining({ dice: [2, 4] }),
        expect.any(Function),
      );
    });

    test("should pass rule bot move function to updateGameState", async () => {
      // Arrange
      mockSecureRandomRange.mockReturnValue(3);
      const mockMoveInput = {
        boardState: {
          [PlayerColor.RED]: [0, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        raceMap: {},
        playerColor: PlayerColor.RED,
        diceState: { dice: [3, 3] },
        possibleActions: [],
      };

      const data: GenerateResultData = {
        currentBoardState: mockMoveInput.boardState,
        currentPlayers: [PlayerColor.RED],
        currentTurnIndex: 0,
        winners: [],
      };

      mockUpdateGameState.mockResolvedValue({
        gameState: {
          board: data.currentBoardState,
          currentPlayer: PlayerColor.RED,
          playerAction: { type: "skip", oldPosition: 0, newPosition: 0 },
          winners: [],
        },
        nextTurn: 0,
      } as any);

      // Act
      await generateResult(data);

      // Assert
      expect(mockUpdateGameState).toHaveBeenCalled();
      const moveFunction = mockUpdateGameState.mock.calls[0][4];
      expect(typeof moveFunction).toBe("function");
    });
  });

  describe("Result structure", () => {
    test("should return result with all required fields", async () => {
      // Arrange
      mockSecureRandomRange.mockReturnValueOnce(4).mockReturnValueOnce(2);

      const data: GenerateResultData = {
        currentBoardState: {
          [PlayerColor.RED]: [10, 0, 0, 0],
          [PlayerColor.GREEN]: [15, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        currentTurnIndex: 0,
        winners: [],
      };

      mockUpdateGameState.mockResolvedValue({
        gameState: {
          board: {
            [PlayerColor.RED]: [16, 0, 0, 0],
            [PlayerColor.GREEN]: [15, 0, 0, 0],
            [PlayerColor.YELLOW]: [0, 0, 0, 0],
            [PlayerColor.BLUE]: [0, 0, 0, 0],
          },
          currentPlayer: PlayerColor.RED,
          playerAction: {
            type: "move",
            oldPosition: 10,
            newPosition: 16,
          },
          winners: [],
        },
        nextTurn: 1,
      } as any);

      // Act
      const result = await generateResult(data);

      // Assert
      expect(result).toHaveProperty("board");
      expect(result).toHaveProperty("nextTurnIndex");
      expect(result).toHaveProperty("currentPlayers");
      expect(result).toHaveProperty("winners");
      expect(result).toHaveProperty("action");
      expect(result).toHaveProperty("dice");
    });

    test("should include player color in action", async () => {
      // Arrange
      mockSecureRandomRange.mockReturnValue(3);

      const data: GenerateResultData = {
        currentBoardState: {
          [PlayerColor.RED]: [0, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [5, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        currentTurnIndex: 2,
        winners: [],
      };

      mockUpdateGameState.mockResolvedValue({
        gameState: {
          board: {
            [PlayerColor.RED]: [0, 0, 0, 0],
            [PlayerColor.GREEN]: [0, 0, 0, 0],
            [PlayerColor.YELLOW]: [11, 0, 0, 0],
            [PlayerColor.BLUE]: [0, 0, 0, 0],
          },
          currentPlayer: PlayerColor.YELLOW,
          playerAction: {
            type: "move",
            oldPosition: 5,
            newPosition: 11,
          },
          winners: [],
        },
        nextTurn: 3,
      } as any);

      // Act
      const result = await generateResult(data);

      // Assert
      expect(result.action.playerColor).toBe(PlayerColor.YELLOW);
    });

    test("should preserve board state from game state", async () => {
      // Arrange
      mockSecureRandomRange.mockReturnValue(2);
      const expectedBoard = {
        [PlayerColor.RED]: [5, 10, 15, 20],
        [PlayerColor.GREEN]: [3, 8, 13, 18],
        [PlayerColor.YELLOW]: [0, 0, 0, 0],
        [PlayerColor.BLUE]: [0, 0, 0, 0],
      };

      const data: GenerateResultData = {
        currentBoardState: expectedBoard,
        currentPlayers: [PlayerColor.RED, PlayerColor.GREEN],
        currentTurnIndex: 0,
        winners: [],
      };

      mockUpdateGameState.mockResolvedValue({
        gameState: {
          board: expectedBoard,
          currentPlayer: PlayerColor.RED,
          playerAction: { type: "skip", oldPosition: 0, newPosition: 0 },
          winners: [],
        },
        nextTurn: 1,
      } as any);

      // Act
      const result = await generateResult(data);

      // Assert
      expect(result.board).toEqual(expectedBoard);
    });
  });

  describe("Winners handling", () => {
    test("should reset winners from previous game and only include new winners", async () => {
      // Arrange
      mockSecureRandomRange.mockReturnValue(5);

      const data: GenerateResultData = {
        currentBoardState: {
          [PlayerColor.RED]: [0, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        currentPlayers: [PlayerColor.RED, PlayerColor.GREEN],
        currentTurnIndex: 0,
        winners: [PlayerColor.YELLOW], // Previous game had a winner
      };

      mockUpdateGameState.mockResolvedValue({
        gameState: {
          board: data.currentBoardState,
          currentPlayer: PlayerColor.RED,
          playerAction: { type: "skip", oldPosition: 0, newPosition: 0 },
          winners: [PlayerColor.BLUE], // New game has new winner
        },
        nextTurn: 1,
      } as any);

      // Act
      const result = await generateResult(data);

      // Assert
      // When there are previous winners, the game resets and only new winners are included
      expect(result.winners).toEqual([PlayerColor.BLUE]);
    });

    test("should handle no winners in current round", async () => {
      // Arrange
      mockSecureRandomRange.mockReturnValue(3);

      const data: GenerateResultData = {
        currentBoardState: {
          [PlayerColor.RED]: [10, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        currentTurnIndex: 0,
        winners: [],
      };

      mockUpdateGameState.mockResolvedValue({
        gameState: {
          board: {
            [PlayerColor.RED]: [13, 0, 0, 0],
            [PlayerColor.GREEN]: [0, 0, 0, 0],
            [PlayerColor.YELLOW]: [0, 0, 0, 0],
            [PlayerColor.BLUE]: [0, 0, 0, 0],
          },
          currentPlayer: PlayerColor.RED,
          playerAction: {
            type: "move",
            oldPosition: 10,
            newPosition: 13,
          },
          winners: [],
        },
        nextTurn: 1,
      } as any);

      // Act
      const result = await generateResult(data);

      // Assert
      expect(result.winners).toEqual([]);
    });

    test("should accumulate winners within the same game when no reset occurs", async () => {
      // Arrange
      mockSecureRandomRange.mockReturnValue(4);

      const data: GenerateResultData = {
        currentBoardState: {
          [PlayerColor.RED]: [10, 20, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        currentPlayers: [PlayerColor.RED],
        currentTurnIndex: 0,
        winners: [], // No previous winners - same game
      };

      mockUpdateGameState.mockResolvedValue({
        gameState: {
          board: data.currentBoardState,
          currentPlayer: PlayerColor.RED,
          playerAction: { type: "skip", oldPosition: 0, newPosition: 0 },
          winners: [PlayerColor.RED],
        },
        nextTurn: 0,
      } as any);

      // Act
      await generateResult(data);

      // Assert
      // Within same game, winners accumulate
      expect(data.winners).toEqual([PlayerColor.RED]);
    });
  });

  describe("Kicked player handling", () => {
    test("should include kicked player when present in game state", async () => {
      // Arrange
      mockSecureRandomRange.mockReturnValue(5);

      const data: GenerateResultData = {
        currentBoardState: {
          [PlayerColor.RED]: [10, 0, 0, 0],
          [PlayerColor.GREEN]: [10, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        currentTurnIndex: 0,
        winners: [],
      };

      mockUpdateGameState.mockResolvedValue({
        gameState: {
          board: {
            [PlayerColor.RED]: [15, 0, 0, 0],
            [PlayerColor.GREEN]: [0, 0, 0, 0],
            [PlayerColor.YELLOW]: [0, 0, 0, 0],
            [PlayerColor.BLUE]: [0, 0, 0, 0],
          },
          currentPlayer: PlayerColor.RED,
          playerAction: {
            type: "move",
            oldPosition: 10,
            newPosition: 15,
          },
          winners: [],
          kickedPlayer: { player: PlayerColor.GREEN },
        },
        nextTurn: 1,
      } as any);

      // Act
      const result = await generateResult(data);

      // Assert
      expect(result.kickedPlayer).toBe(PlayerColor.GREEN);
    });

    test("should handle no kicked player", async () => {
      // Arrange
      mockSecureRandomRange.mockReturnValue(3);

      const data: GenerateResultData = {
        currentBoardState: {
          [PlayerColor.RED]: [5, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        currentPlayers: [PlayerColor.RED],
        currentTurnIndex: 0,
        winners: [],
      };

      mockUpdateGameState.mockResolvedValue({
        gameState: {
          board: {
            [PlayerColor.RED]: [8, 0, 0, 0],
            [PlayerColor.GREEN]: [0, 0, 0, 0],
            [PlayerColor.YELLOW]: [0, 0, 0, 0],
            [PlayerColor.BLUE]: [0, 0, 0, 0],
          },
          currentPlayer: PlayerColor.RED,
          playerAction: {
            type: "move",
            oldPosition: 5,
            newPosition: 8,
          },
          winners: [],
        },
        nextTurn: 0,
      } as any);

      // Act
      const result = await generateResult(data);

      // Assert
      expect(result.kickedPlayer).toBeUndefined();
    });
  });

  describe("Current players preservation", () => {
    test("should preserve current players array in result", async () => {
      // Arrange
      mockSecureRandomRange.mockReturnValue(2);
      const currentPlayers = [PlayerColor.RED, PlayerColor.BLUE];

      const data: GenerateResultData = {
        currentBoardState: {
          [PlayerColor.RED]: [0, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        currentPlayers,
        currentTurnIndex: 0,
        winners: [],
      };

      mockUpdateGameState.mockResolvedValue({
        gameState: {
          board: data.currentBoardState,
          currentPlayer: PlayerColor.RED,
          playerAction: { type: "skip", oldPosition: 0, newPosition: 0 },
          winners: [],
        },
        nextTurn: 1,
      } as any);

      // Act
      const result = await generateResult(data);

      // Assert
      expect(result.currentPlayers).toEqual(currentPlayers);
    });
  });
});
