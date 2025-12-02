import { DiceState, getActions, PlayerColor } from "@rd/ludo-rules";
import { generateOdds } from "../../../src/helpers/generate-odds.js";
import { ruleBotInstance } from "../../../src/helpers/rule-bot-instance.js";
import { IResult } from "../../../src/models/interfaces/result.js";

// Mock dependencies
jest.mock("@rd/ludo-rules", () => ({
  PlayerColor: {
    RED: "red",
    GREEN: "green",
    YELLOW: "yellow",
    BLUE: "blue",
  },
  DiceState: jest.fn(),
  getActions: jest.fn(),
  getRaceMap: jest.fn(),
  isSkipAction: jest.fn(),
  isReleaseAction: jest.fn(),
  isGoToStableAction: jest.fn(),
  isKickAction: jest.fn(),
}));

jest.mock("../../../src/helpers/rule-bot-instance.js", () => ({
  ruleBotInstance: {
    move: jest.fn(),
  },
}));

import {
  getRaceMap,
  isGoToStableAction,
  isKickAction,
  isReleaseAction,
  isSkipAction,
} from "@rd/ludo-rules";
import { BET_CHOICES, MARGIN_KEYS } from "../../../src/constants.js";
import {
  generateMargins,
  generateMarginsWithoutPrefix,
} from "../__mock__/margins.js";

const mockMargins = generateMarginsWithoutPrefix(0.05);

describe("generateOdds", () => {
  let mockResult: IResult;
  let mockGetRaceMap: jest.MockedFunction<typeof getRaceMap>;
  let mockGetActions: jest.MockedFunction<typeof getActions>;
  let mockIsSkipAction: jest.MockedFunction<typeof isSkipAction>;
  let mockIsReleaseAction: jest.MockedFunction<typeof isReleaseAction>;
  let mockIsGoToStableAction: jest.MockedFunction<typeof isGoToStableAction>;
  let mockIsKickAction: jest.MockedFunction<typeof isKickAction>;
  let mockRuleBotMove: jest.MockedFunction<typeof ruleBotInstance.move>;

  beforeEach(() => {
    // Arrange - Reset all mocks before each test
    jest.clearAllMocks();

    mockGetRaceMap = getRaceMap as jest.MockedFunction<typeof getRaceMap>;
    mockGetActions = getActions as jest.MockedFunction<typeof getActions>;
    mockIsSkipAction = isSkipAction as jest.MockedFunction<typeof isSkipAction>;
    mockIsReleaseAction = isReleaseAction as jest.MockedFunction<
      typeof isReleaseAction
    >;
    mockIsGoToStableAction = isGoToStableAction as jest.MockedFunction<
      typeof isGoToStableAction
    >;
    mockIsKickAction = isKickAction as jest.MockedFunction<typeof isKickAction>;
    mockRuleBotMove = ruleBotInstance.move as jest.MockedFunction<
      typeof ruleBotInstance.move
    >;

    // Default mock result
    mockResult = {
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
      action: {
        oldPosition: 0,
        newPosition: 0,
        playerColor: PlayerColor.RED,
      },
      dice: [3, 4],
    };

    // Default mock implementations
    mockGetRaceMap.mockReturnValue({});
    mockGetActions.mockReturnValue([]);
    (DiceState as jest.Mock).mockImplementation((dice) => ({ dice }));
    mockRuleBotMove.mockResolvedValue({
      oldPosition: 0,
      newPosition: 0,
    });
    mockIsSkipAction.mockReturnValue(false);
    mockIsReleaseAction.mockReturnValue(false);
    mockIsGoToStableAction.mockReturnValue(false);
    mockIsKickAction.mockReturnValue(false);
  });

  describe("Odds calculation structure", () => {
    test("should return odds object with all 12 required keys", async () => {
      // Act
      const odds = await generateOdds(mockMargins, mockResult);

      // Assert
      expect(odds).toHaveProperty("big");
      expect(odds).toHaveProperty("small");
      expect(odds).toHaveProperty("odd");
      expect(odds).toHaveProperty("even");
      expect(odds).toHaveProperty("move");
      expect(odds).toHaveProperty("noMove");
      expect(odds).toHaveProperty("release");
      expect(odds).toHaveProperty("noRelease");
      expect(odds).toHaveProperty("goStable");
      expect(odds).toHaveProperty("noStable");
      expect(odds).toHaveProperty("kick");
      expect(odds).toHaveProperty("noKick");
    });
  });

  describe("Dice probability calculations", () => {
    const margins = generateMarginsWithoutPrefix(0);
    test("should calculate big odds based on dice combinations > 6", async () => {
      // Arrange
      mockIsSkipAction.mockReturnValue(true);

      // Act
      const odds = await generateOdds(margins, mockResult);

      // Assert
      // Dice sum > 6: 21 combinations out of 36
      // Expected: 1 / (21/36) - 0 = 36/21 = 1.714...
      expect(odds.big).toBeCloseTo(36 / 21, 2);
    });

    test("should calculate small odds based on dice combinations <= 6", async () => {
      // Arrange
      mockIsSkipAction.mockReturnValue(true);

      // Act
      const odds = await generateOdds(margins, mockResult);

      // Assert
      // Dice sum <= 6: 15 combinations out of 36
      // Expected: 1 / (15/36) - 0 = 36/15 = 2.4
      expect(odds.small).toBeCloseTo(36 / 15, 2);
    });

    test("should calculate odd odds correctly", async () => {
      // Arrange
      mockIsSkipAction.mockReturnValue(true);

      // Act
      const odds = await generateOdds(margins, mockResult);

      // Assert
      // Odd sums: 18 combinations out of 36
      // Expected: 1 / (18/36) - 0 = 2
      expect(odds.odd).toBeCloseTo(2, 2);
    });

    test("should calculate even odds correctly", async () => {
      // Arrange
      mockIsSkipAction.mockReturnValue(true);

      // Act
      const odds = await generateOdds(margins, mockResult);

      // Assert
      // Even sums: 18 combinations out of 36
      // Expected: 1 / (18/36) - 0 = 2
      expect(odds.even).toBeCloseTo(2, 2);
    });
  });

  describe("Margin application", () => {
    test("should apply margin reduction to all odds", async () => {
      // Arrange
      const margins = generateMarginsWithoutPrefix(0.1);
      const zeroMargins = generateMarginsWithoutPrefix(0);
      mockIsSkipAction.mockReturnValue(true);

      // Act
      const oddsWithMargin = await generateOdds(margins, mockResult);
      const oddsWithoutMargin = await generateOdds(zeroMargins, mockResult);

      // Assert
      expect(oddsWithMargin.big).toBeCloseTo(
        oddsWithoutMargin.big * (1 - margins[BET_CHOICES.big]),
        2,
      );
      expect(oddsWithMargin.small).toBeCloseTo(
        oddsWithoutMargin.small * (1 - margins[BET_CHOICES.small]),
        2,
      );
      expect(oddsWithMargin.odd).toBeCloseTo(
        oddsWithoutMargin.odd * (1 - margins[BET_CHOICES.odd]),
        2,
      );
      expect(oddsWithMargin.even).toBeCloseTo(
        oddsWithoutMargin.even * (1 - margins[BET_CHOICES.even]),
        2,
      );
    });

    test("should handle zero margin", async () => {
      // Arrange
      const margins = generateMarginsWithoutPrefix(0);
      mockIsSkipAction.mockReturnValue(true);

      // Act
      const odds = await generateOdds(margins, mockResult);

      // Assert
      expect(odds.big).toBeGreaterThan(0);
      expect(odds.small).toBeGreaterThan(0);
      expect(odds.odd).toBeCloseTo(2, 2);
      expect(odds.even).toBeCloseTo(2, 2);
    });
  });

  describe("Action-based odds - Move/NoMove", () => {
    const margins = generateMarginsWithoutPrefix(0);
    test("should return 0 for move odds when no actions are available", async () => {
      // Arrange
      mockIsSkipAction.mockReturnValue(false); // All 36 combinations result in move
      mockRuleBotMove.mockResolvedValue({
        oldPosition: 0,
        newPosition: 5,
      });

      // Act
      const odds = await generateOdds(margins, mockResult);

      // Assert
      expect(odds.move).toBe(0);
    });

    test("should return 0 for noMove odds when all combinations are skips", async () => {
      // Arrange
      mockIsSkipAction.mockReturnValue(true);
      mockRuleBotMove.mockResolvedValue({
        oldPosition: 0,
        newPosition: 0,
      });

      // Act
      const odds = await generateOdds(margins, mockResult);

      // Assert
      expect(odds.noMove).toBe(0);
    });

    test("should calculate mixed move/noMove odds", async () => {
      // Arrange
      let callCount = 0;
      mockIsSkipAction.mockImplementation(() => {
        callCount++;
        return callCount <= 12; // First 12 calls are skip, rest are move
      });

      // Act
      const odds = await generateOdds(margins, mockResult);

      // Assert
      // 12 skips, 24 moves
      expect(odds.noMove).toBeCloseTo(36 / 12, 2); // 3
      expect(odds.move).toBeCloseTo(36 / 24, 2); // 1.5
    });
  });

  describe("Action-based odds - Release/NoRelease", () => {
    const margins = generateMarginsWithoutPrefix(0);
    test("should return 0 for release odds when all combinations are releases", async () => {
      // Arrange
      mockIsReleaseAction.mockReturnValue(true);

      // Act
      const odds = await generateOdds(margins, mockResult);

      // Assert
      expect(odds.release).toBe(0);
    });

    test("should calculate noRelease odds correctly", async () => {
      // Arrange
      mockIsReleaseAction.mockReturnValue(false); // No combinations are releases

      // Act
      const odds = await generateOdds(margins, mockResult);

      // Assert
      expect(odds.noRelease).toBe(0);
    });

    test("should handle partial release scenarios", async () => {
      // Arrange
      let callCount = 0;
      mockIsReleaseAction.mockImplementation(() => {
        callCount++;
        return callCount <= 6; // First 6 calls are releases
      });

      // Act
      const odds = await generateOdds(margins, mockResult);

      // Assert
      expect(odds.release).toBeCloseTo(36 / 6, 2); // 6
      expect(odds.noRelease).toBeCloseTo(36 / 30, 2); // 1.2
    });
  });

  describe("Action-based odds - GoStable/NoStable", () => {
    const margins = generateMarginsWithoutPrefix(0);
    test("should return 0 for goStable odds when all combinations are go to stable", async () => {
      // Arrange
      mockIsGoToStableAction.mockReturnValue(true);

      // Act
      const odds = await generateOdds(margins, mockResult);

      // Assert
      expect(odds.goStable).toBe(0);
    });

    test("should return 0 for noStable odds when all combinations are not go to stable", async () => {
      // Arrange
      mockIsGoToStableAction.mockReturnValue(false);

      // Act
      const odds = await generateOdds(margins, mockResult);

      // Assert
      expect(odds.noStable).toBe(0);
    });

    test("should handle mixed stable scenarios", async () => {
      // Arrange
      let callCount = 0;
      mockIsGoToStableAction.mockImplementation(() => {
        callCount++;
        return callCount <= 3; // First 3 calls go to stable
      });

      // Act
      const odds = await generateOdds(margins, mockResult);

      // Assert
      expect(odds.goStable).toBeCloseTo(36 / 3, 2); // 12
      expect(odds.noStable).toBeCloseTo(36 / 33, 2); // ~1.09
    });
  });

  describe("Action-based odds - Kick/NoKick", () => {
    const margins = generateMarginsWithoutPrefix(0);
    test("should return 0 for kick odds when all combinations are kicks", async () => {
      // Arrange
      mockIsKickAction.mockReturnValue(true);

      // Act
      const odds = await generateOdds(margins, mockResult);

      // Assert
      expect(odds.kick).toBe(0);
    });

    test("should return 0 for noKick odds when all combinations are not kicks", async () => {
      // Arrange
      mockIsKickAction.mockReturnValue(false);

      // Act
      const odds = await generateOdds(margins, mockResult);

      // Assert
      expect(odds.noKick).toBe(0);
    });

    test("should handle partial kick scenarios", async () => {
      // Arrange
      let callCount = 0;
      mockIsKickAction.mockImplementation(() => {
        callCount++;
        return callCount <= 9; // First 9 calls are kicks
      });

      // Act
      const odds = await generateOdds(margins, mockResult);

      // Assert
      expect(odds.kick).toBeCloseTo(36 / 9, 2); // 4
      expect(odds.noKick).toBeCloseTo(36 / 27, 2); // ~1.33
    });
  });

  describe("Integration with game state", () => {
    test("should iterate through all 36 dice combinations", async () => {
      // Act
      await generateOdds(mockMargins, mockResult);

      // Assert
      expect(DiceState).toHaveBeenCalledTimes(36);
    });

    test("should call getActions for each dice combination", async () => {
      // Act
      await generateOdds(mockMargins, mockResult);

      // Assert
      expect(mockGetActions).toHaveBeenCalledTimes(36);
    });

    test("should call ruleBotInstance.move for each dice combination", async () => {
      // Act
      await generateOdds(mockMargins, mockResult);

      // Assert
      expect(mockRuleBotMove).toHaveBeenCalledTimes(36);
    });

    test("should use correct player color from result", async () => {
      // Arrange
      mockResult.nextTurnIndex = 2;
      mockResult.currentPlayers = [
        PlayerColor.RED,
        PlayerColor.GREEN,
        PlayerColor.YELLOW,
        PlayerColor.BLUE,
      ];

      // Act
      await generateOdds(generateMargins(0), mockResult);

      // Assert
      expect(mockGetActions).toHaveBeenCalledWith(
        expect.objectContaining({
          playerColor: PlayerColor.YELLOW,
        }),
      );
    });

    test("should use board state from result", async () => {
      // Arrange
      const customBoard = {
        [PlayerColor.RED]: [10, 20, 30, 40],
        [PlayerColor.GREEN]: [15, 25, 35, 45],
        [PlayerColor.YELLOW]: [0, 0, 0, 0],
        [PlayerColor.BLUE]: [0, 0, 0, 0],
      };
      mockResult.board = customBoard;

      // Act
      await generateOdds(generateMargins(0), mockResult);

      // Assert
      expect(mockGetActions).toHaveBeenCalledWith(
        expect.objectContaining({
          boardState: customBoard,
        }),
      );
    });

    test("should call getRaceMap with board state", async () => {
      // Arrange
      const customBoard = {
        [PlayerColor.RED]: [5, 10, 0, 0],
        [PlayerColor.GREEN]: [0, 0, 0, 0],
        [PlayerColor.YELLOW]: [0, 0, 0, 0],
        [PlayerColor.BLUE]: [0, 0, 0, 0],
      };
      mockResult.board = customBoard;

      // Act
      await generateOdds(generateMargins(0), mockResult);

      // Assert
      expect(mockGetRaceMap).toHaveBeenCalledWith(customBoard);
      expect(mockGetRaceMap).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge cases", () => {
    test("should handle result with different turn indices", async () => {
      // Arrange
      mockResult.nextTurnIndex = 3;
      mockIsSkipAction.mockReturnValue(true);

      // Act
      const odds = await generateOdds(mockMargins, mockResult);

      // Assert
      expect(odds).toBeDefined();
      expect(Object.keys(odds)).toHaveLength(12);
    });

    test("should handle empty board state", async () => {
      // Arrange
      mockResult.board = {
        [PlayerColor.RED]: [0, 0, 0, 0],
        [PlayerColor.GREEN]: [0, 0, 0, 0],
        [PlayerColor.YELLOW]: [0, 0, 0, 0],
        [PlayerColor.BLUE]: [0, 0, 0, 0],
      };
      // Mix of actions to avoid division by zero
      let callCount = 0;
      mockIsSkipAction.mockImplementation(() => {
        callCount++;
        return callCount <= 18; // Half skip, half move
      });
      mockIsReleaseAction.mockReturnValue(false);
      mockIsGoToStableAction.mockReturnValue(false);
      mockIsKickAction.mockReturnValue(false);

      // Act
      const odds = await generateOdds(mockMargins, mockResult);

      // Assert
      expect(odds).toBeDefined();
      expect(Object.keys(odds)).toHaveLength(12);
    });

    test("should handle complex board state with multiple pieces", async () => {
      // Arrange
      mockResult.board = {
        [PlayerColor.RED]: [5, 10, 15, 20],
        [PlayerColor.GREEN]: [8, 18, 28, 38],
        [PlayerColor.YELLOW]: [12, 22, 32, 42],
        [PlayerColor.BLUE]: [3, 13, 23, 33],
      };
      mockIsSkipAction.mockReturnValue(false);

      // Act
      const odds = await generateOdds(generateMargins(0.1), mockResult);

      // Assert
      expect(odds).toBeDefined();
      expect(Object.keys(odds)).toHaveLength(12);
    });
  });

  describe("Dice combinations coverage", () => {
    test("should process all dice values from 1 to 6 for first die", async () => {
      // Arrange
      const diceValues: number[][] = [];
      (DiceState as jest.Mock).mockImplementation((dice) => {
        diceValues.push([...dice]);
        return { dice };
      });

      // Act
      await generateOdds(generateMargins(0), mockResult);

      // Assert
      const firstDieValues = [...new Set(diceValues.map((d) => d[0]))];
      expect(firstDieValues.sort()).toEqual([1, 2, 3, 4, 5, 6]);
    });

    test("should process all dice values from 1 to 6 for second die", async () => {
      // Arrange
      const diceValues: number[][] = [];
      (DiceState as jest.Mock).mockImplementation((dice) => {
        diceValues.push([...dice]);
        return { dice };
      });

      // Act
      await generateOdds(generateMargins(0), mockResult);

      // Assert
      const secondDieValues = [...new Set(diceValues.map((d) => d[1]))];
      expect(secondDieValues.sort()).toEqual([1, 2, 3, 4, 5, 6]);
    });

    test("should create exactly 36 unique dice combinations", async () => {
      // Arrange
      const diceValues: string[] = [];
      (DiceState as jest.Mock).mockImplementation((dice) => {
        diceValues.push(`${dice[0]}-${dice[1]}`);
        return { dice };
      });

      // Act
      await generateOdds(generateMargins(0), mockResult);

      // Assert
      expect(diceValues).toHaveLength(36);
      expect(new Set(diceValues).size).toBe(36);
    });
  });
});
