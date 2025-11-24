import { PlayerColor } from "@rd/ludo-rules";
import { generateSettlementResult } from "../../../src/helpers/generate-settlement-result.js";
import { IResult } from "../../../src/models/interfaces/result.js";

// Mock ludo-rules functions
jest.mock("@rd/ludo-rules", () => ({
  PlayerColor: {
    RED: "red",
    GREEN: "green",
    YELLOW: "yellow",
    BLUE: "blue",
  },
  getRaceMap: jest.fn((board) => {
    // Simple mock implementation - map positions to colors
    const raceMap: any = {};
    Object.entries(board).forEach(([color, positions]: [string, any]) => {
      (positions as number[]).forEach((pos: number) => {
        if (pos > 0) {
          raceMap[pos] = color;
        }
      });
    });
    return raceMap;
  }),
  isSkipAction: jest.fn((action) => action.type === "skip"),
  isReleaseAction: jest.fn((action) => action.type === "release"),
  isGoToStableAction: jest.fn((action) => {
    // Stable area is typically position >= 56
    return action.type === "move" && action.newPosition >= 56;
  }),
  isKickAction: jest.fn((action, raceMap) => {
    // Check if newPosition has another player
    return (
      raceMap &&
      raceMap[action.newPosition] !== undefined &&
      action.type !== "skip"
    );
  }),
}));

describe("generateSettlementResult", () => {
  // Helper function to create mock result objects
  const createMockResult = (
    dice: number[],
    action: any,
    board: any = {
      [PlayerColor.RED]: [0, 0, 0, 0],
      [PlayerColor.GREEN]: [0, 0, 0, 0],
      [PlayerColor.YELLOW]: [0, 0, 0, 0],
      [PlayerColor.BLUE]: [0, 0, 0, 0],
    },
  ): IResult => ({
    dice,
    action,
    board,
    nextTurnIndex: 0,
    currentPlayers: [
      PlayerColor.RED,
      PlayerColor.GREEN,
      PlayerColor.YELLOW,
      PlayerColor.BLUE,
    ],
    winners: [],
  });

  describe("Function output structure", () => {
    test("should return an object with all 12 required settlement keys", () => {
      // Arrange
      const result = createMockResult([3, 3], {
        type: "move",
        oldPosition: 5,
        newPosition: 11,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(Object.keys(settlement)).toHaveLength(12);
      expect(settlement).toHaveProperty("big");
      expect(settlement).toHaveProperty("small");
      expect(settlement).toHaveProperty("odd");
      expect(settlement).toHaveProperty("even");
      expect(settlement).toHaveProperty("move");
      expect(settlement).toHaveProperty("noMove");
      expect(settlement).toHaveProperty("release");
      expect(settlement).toHaveProperty("noRelease");
      expect(settlement).toHaveProperty("goStable");
      expect(settlement).toHaveProperty("noStable");
      expect(settlement).toHaveProperty("kick");
      expect(settlement).toHaveProperty("noKick");
    });

    test("should return all boolean values", () => {
      // Arrange
      const result = createMockResult([4, 5], {
        type: "move",
        oldPosition: 0,
        newPosition: 9,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);
      const allValuesAreBoolean = Object.values(settlement).every(
        (value) => typeof value === "boolean",
      );

      // Assert
      expect(allValuesAreBoolean).toBe(true);
    });
  });

  describe("Dice sum - Big/Small calculations", () => {
    test("should return big=true and small=false when dice sum is 7", () => {
      // Arrange
      const result = createMockResult([4, 3], {
        type: "move",
        oldPosition: 0,
        newPosition: 7,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.big).toBe(true);
      expect(settlement.small).toBe(false);
    });

    test("should return big=true and small=false when dice sum is greater than 6", () => {
      // Arrange
      const result = createMockResult([4, 5], {
        type: "move",
        oldPosition: 0,
        newPosition: 9,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.big).toBe(true);
      expect(settlement.small).toBe(false);
    });

    test("should return big=false and small=true when dice sum is less than 6", () => {
      // Arrange
      const result = createMockResult([2, 3], {
        type: "move",
        oldPosition: 0,
        newPosition: 5,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.big).toBe(false);
      expect(settlement.small).toBe(true);
    });

    test("should return big=false and small=true when dice sum equals 6", () => {
      // Arrange
      const result = createMockResult([3, 3], {
        type: "move",
        oldPosition: 0,
        newPosition: 6,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.big).toBe(false);
      expect(settlement.small).toBe(true);
    });

    test("should handle minimum dice sum of 2 as small", () => {
      // Arrange
      const result = createMockResult([1, 1], {
        type: "move",
        oldPosition: 0,
        newPosition: 2,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.small).toBe(true);
      expect(settlement.big).toBe(false);
    });

    test("should handle maximum dice sum of 12 as big", () => {
      // Arrange
      const result = createMockResult([6, 6], {
        type: "move",
        oldPosition: 0,
        newPosition: 12,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.big).toBe(true);
      expect(settlement.small).toBe(false);
    });
  });

  describe("Dice sum - Odd/Even calculations", () => {
    test("should return odd=false and even=true when dice sum is even", () => {
      // Arrange
      const result = createMockResult([3, 3], {
        type: "move",
        oldPosition: 0,
        newPosition: 6,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.odd).toBe(false);
      expect(settlement.even).toBe(true);
    });

    test("should return odd=true and even=false when dice sum is odd", () => {
      // Arrange
      const result = createMockResult([2, 3], {
        type: "move",
        oldPosition: 0,
        newPosition: 5,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.odd).toBe(true);
      expect(settlement.even).toBe(false);
    });

    test("should correctly identify even sum with different dice combinations", () => {
      // Arrange
      const result = createMockResult([4, 4], {
        type: "move",
        oldPosition: 0,
        newPosition: 8,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.even).toBe(true);
      expect(settlement.odd).toBe(false);
    });

    test("should correctly identify odd sum with different dice combinations", () => {
      // Arrange
      const result = createMockResult([1, 6], {
        type: "move",
        oldPosition: 0,
        newPosition: 7,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.odd).toBe(true);
      expect(settlement.even).toBe(false);
    });
  });

  describe("Action type - Move/NoMove", () => {
    test("should return move=true and noMove=false for move action", () => {
      // Arrange
      const result = createMockResult([3, 2], {
        type: "move",
        oldPosition: 5,
        newPosition: 10,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.move).toBe(true);
      expect(settlement.noMove).toBe(false);
    });

    test("should return move=false and noMove=true for skip action", () => {
      // Arrange
      const result = createMockResult([2, 3], {
        type: "skip",
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.move).toBe(false);
      expect(settlement.noMove).toBe(true);
    });
  });

  describe("Action type - Release/NoRelease", () => {
    test("should return release=true and noRelease=false for release action", () => {
      // Arrange
      const result = createMockResult([6, 1], {
        type: "release",
        oldPosition: 0,
        newPosition: 1,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.release).toBe(true);
      expect(settlement.noRelease).toBe(false);
    });

    test("should return release=false and noRelease=true for non-release action", () => {
      // Arrange
      const result = createMockResult([3, 2], {
        type: "move",
        oldPosition: 5,
        newPosition: 10,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.release).toBe(false);
      expect(settlement.noRelease).toBe(true);
    });
  });

  describe("Action type - GoStable/NoStable", () => {
    test("should detect goStable when piece moves to stable area", () => {
      // Arrange - Moving to stable position (position >= 56 for most implementations)
      const result = createMockResult([2, 1], {
        type: "move",
        oldPosition: 55,
        newPosition: 56,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement).toHaveProperty("goStable");
      expect(settlement).toHaveProperty("noStable");
      expect(settlement.goStable).toBe(true);
      expect(settlement.noStable).toBe(false);
    });

    test("should return noStable=true for regular move action", () => {
      // Arrange
      const result = createMockResult([3, 2], {
        type: "move",
        oldPosition: 5,
        newPosition: 10,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement).toHaveProperty("goStable");
      expect(settlement).toHaveProperty("noStable");
      expect(settlement.goStable).toBe(false);
      expect(settlement.noStable).toBe(true);
    });
  });

  describe("Action type - Kick/NoKick", () => {
    test("should detect kick when another player occupies the destination position", () => {
      // Arrange
      const board = {
        [PlayerColor.RED]: [5, 0, 0, 0],
        [PlayerColor.GREEN]: [10, 0, 0, 0], // Green piece at position 10
        [PlayerColor.YELLOW]: [0, 0, 0, 0],
        [PlayerColor.BLUE]: [0, 0, 0, 0],
      };
      const result = createMockResult(
        [3, 2],
        {
          type: "move",
          oldPosition: 5,
          newPosition: 10,
          playerColor: PlayerColor.RED,
        },
        board,
      );

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.kick).toBe(true);
      expect(settlement.noKick).toBe(false);
    });

    test("should return noKick=true when moving to an empty position", () => {
      // Arrange
      const result = createMockResult([3, 2], {
        type: "move",
        oldPosition: 5,
        newPosition: 10,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.kick).toBe(false);
      expect(settlement.noKick).toBe(true);
    });

    test("should return noKick=true for skip action", () => {
      // Arrange
      const result = createMockResult([2, 1], {
        type: "skip",
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.kick).toBe(false);
      expect(settlement.noKick).toBe(true);
    });

    test("should detect kick with multiple opponent pieces on board", () => {
      // Arrange
      const board = {
        [PlayerColor.RED]: [5, 15, 0, 0],
        [PlayerColor.GREEN]: [10, 20, 0, 0],
        [PlayerColor.YELLOW]: [25, 0, 0, 0],
        [PlayerColor.BLUE]: [30, 0, 0, 0],
      };
      const result = createMockResult(
        [3, 2],
        {
          type: "move",
          oldPosition: 5,
          newPosition: 10,
          playerColor: PlayerColor.RED,
        },
        board,
      );

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.kick).toBe(true);
      expect(settlement.noKick).toBe(false);
    });
  });

  describe("Mutually exclusive properties validation", () => {
    test("should ensure big and small are mutually exclusive", () => {
      // Arrange
      const result = createMockResult([4, 5], {
        type: "move",
        oldPosition: 0,
        newPosition: 9,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.big).toBe(!settlement.small);
      expect(settlement.big !== settlement.small).toBe(true);
    });

    test("should ensure odd and even are mutually exclusive", () => {
      // Arrange
      const result = createMockResult([3, 3], {
        type: "move",
        oldPosition: 0,
        newPosition: 6,
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.odd).toBe(!settlement.even);
      expect(settlement.odd !== settlement.even).toBe(true);
    });

    test("should ensure move and noMove are mutually exclusive", () => {
      // Arrange
      const result = createMockResult([3, 2], {
        type: "skip",
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.move).toBe(!settlement.noMove);
      expect(settlement.move !== settlement.noMove).toBe(true);
    });

    test("should ensure all paired properties are mutually exclusive", () => {
      // Arrange
      const result = createMockResult([4, 5], {
        type: "skip",
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.big).toBe(!settlement.small);
      expect(settlement.odd).toBe(!settlement.even);
      expect(settlement.move).toBe(!settlement.noMove);
      expect(settlement.release).toBe(!settlement.noRelease);
      expect(settlement.goStable).toBe(!settlement.noStable);
      expect(settlement.kick).toBe(!settlement.noKick);
    });
  });

  describe("Edge cases and combinations", () => {
    test("should handle release action that also results in a kick", () => {
      // Arrange
      const board = {
        [PlayerColor.RED]: [0, 0, 0, 0],
        [PlayerColor.GREEN]: [1, 0, 0, 0], // Green at position 1
        [PlayerColor.YELLOW]: [0, 0, 0, 0],
        [PlayerColor.BLUE]: [0, 0, 0, 0],
      };
      const result = createMockResult(
        [6, 1],
        {
          type: "release",
          oldPosition: 0,
          newPosition: 1,
          playerColor: PlayerColor.RED,
        },
        board,
      );

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.release).toBe(true);
      expect(settlement.kick).toBe(true);
      expect(settlement.move).toBe(true); // release is considered a move (not a skip)
      expect(settlement.noMove).toBe(false);
    });

    test("should handle skip action with big dice", () => {
      // Arrange
      const result = createMockResult([6, 5], {
        type: "skip",
        playerColor: PlayerColor.RED,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.big).toBe(true);
      expect(settlement.odd).toBe(true);
      expect(settlement.noMove).toBe(true);
      expect(settlement.noRelease).toBe(true);
      expect(settlement.noKick).toBe(true);
    });

    test("should handle different player colors correctly", () => {
      // Arrange
      const result = createMockResult([3, 4], {
        type: "move",
        oldPosition: 10,
        newPosition: 17,
        playerColor: PlayerColor.BLUE,
      });

      // Act
      const settlement = generateSettlementResult(result);

      // Assert
      expect(settlement.odd).toBe(true);
      expect(settlement.big).toBe(true);
      expect(settlement.move).toBe(true);
    });
  });
});
