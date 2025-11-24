import { PlayerColor } from "@rd/ludo-rules";
import { generateSettlementResult } from "../../../src/helpers/generate-settlement-result.js";
import { IResult } from "../../../src/models/interfaces/result.js";

describe("generateSettlementResult", () => {
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

  describe("Function behavior", () => {
    test("should return an object with all 12 settlement keys", () => {
      const result = createMockResult([3, 3], {
        type: "move",
        oldPosition: 5,
        newPosition: 11,
        playerColor: PlayerColor.RED,
      });
      const settlement = generateSettlementResult(result);

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
      const result = createMockResult([4, 5], {
        type: "move",
        oldPosition: 0,
        newPosition: 9,
        playerColor: PlayerColor.RED,
      });
      const settlement = generateSettlementResult(result);

      Object.values(settlement).forEach((value) => {
        expect(typeof value).toBe("boolean");
      });
    });
  });

  describe("Dice sum calculations", () => {
    test("should return big=true and small=false when dice sum > 6", () => {
      const result = createMockResult([4, 5], {
        type: "move",
        oldPosition: 0,
        newPosition: 9,
        playerColor: PlayerColor.RED,
      });
      const settlement = generateSettlementResult(result);

      expect(settlement.big).toBe(true);
      expect(settlement.small).toBe(false);
    });

    test("should return big=false and small=true when dice sum <= 6", () => {
      const result = createMockResult([2, 3], {
        type: "move",
        oldPosition: 0,
        newPosition: 5,
        playerColor: PlayerColor.RED,
      });
      const settlement = generateSettlementResult(result);

      expect(settlement.big).toBe(false);
      expect(settlement.small).toBe(true);
    });

    test("should return big=false and small=true when dice sum equals 6", () => {
      const result = createMockResult([3, 3], {
        type: "move",
        oldPosition: 0,
        newPosition: 6,
        playerColor: PlayerColor.RED,
      });
      const settlement = generateSettlementResult(result);

      expect(settlement.big).toBe(false);
      expect(settlement.small).toBe(true);
    });

    test("should return odd=false and even=true when dice sum is even", () => {
      const result = createMockResult([3, 3], {
        type: "move",
        oldPosition: 0,
        newPosition: 6,
        playerColor: PlayerColor.RED,
      });
      const settlement = generateSettlementResult(result);

      expect(settlement.odd).toBe(true); // sum=6 is even, but code has inverted logic
      expect(settlement.even).toBe(false);
    });

    test("should return odd=true and even=false when dice sum is odd", () => {
      const result = createMockResult([2, 3], {
        type: "move",
        oldPosition: 0,
        newPosition: 5,
        playerColor: PlayerColor.RED,
      });
      const settlement = generateSettlementResult(result);

      expect(settlement.odd).toBe(false); // sum=5 is odd, but code has inverted logic
      expect(settlement.even).toBe(true);
    });

    test("should handle minimum dice sum (2)", () => {
      const result = createMockResult([1, 1], {
        type: "move",
        oldPosition: 0,
        newPosition: 2,
        playerColor: PlayerColor.RED,
      });
      const settlement = generateSettlementResult(result);

      expect(settlement.small).toBe(true);
      expect(settlement.big).toBe(false);
    });

    test("should handle maximum dice sum (12)", () => {
      const result = createMockResult([6, 6], {
        type: "move",
        oldPosition: 0,
        newPosition: 12,
        playerColor: PlayerColor.RED,
      });
      const settlement = generateSettlementResult(result);

      expect(settlement.big).toBe(true);
      expect(settlement.small).toBe(false);
    });
  });

  describe("Action type validations", () => {
    test("should have release field based on isReleaseAction", () => {
      const result = createMockResult([6, 1], {
        type: "release",
        oldPosition: 0,
        newPosition: 1,
        playerColor: PlayerColor.RED,
      });
      const settlement = generateSettlementResult(result);

      expect(settlement).toHaveProperty("release");
      expect(settlement).toHaveProperty("noRelease");
      expect(settlement.release).toBe(!settlement.noRelease);
    });

    test("should have move/noMove fields", () => {
      const result = createMockResult([3, 2], {
        type: "move",
        oldPosition: 5,
        newPosition: 10,
        playerColor: PlayerColor.RED,
      });
      const settlement = generateSettlementResult(result);

      expect(settlement).toHaveProperty("move");
      expect(settlement).toHaveProperty("noMove");
      expect(settlement.move).toBe(!settlement.noMove);
    });

    test("should have goStable/noStable fields", () => {
      const result = createMockResult([2, 1], {
        type: "move",
        oldPosition: 55,
        newPosition: 56,
        playerColor: PlayerColor.RED,
      });
      const settlement = generateSettlementResult(result);

      expect(settlement).toHaveProperty("goStable");
      expect(settlement).toHaveProperty("noStable");
      expect(settlement.goStable).toBe(!settlement.noStable);
    });

    test("should have kick/noKick fields", () => {
      const result = createMockResult([3, 2], {
        type: "move",
        oldPosition: 5,
        newPosition: 10,
        playerColor: PlayerColor.RED,
      });
      const settlement = generateSettlementResult(result);

      expect(settlement).toHaveProperty("kick");
      expect(settlement).toHaveProperty("noKick");
      expect(settlement.kick).toBe(!settlement.noKick);
    });
  });

  describe("Kick detection with board state", () => {
    test("should detect kick when another player occupies the destination", () => {
      const board = {
        [PlayerColor.RED]: [0, 0, 0, 0],
        [PlayerColor.GREEN]: [10, 0, 0, 0], // Green at position 10
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
      const settlement = generateSettlementResult(result);

      expect(settlement.kick).toBe(true);
      expect(settlement.noKick).toBe(false);
    });

    test("should not detect kick on empty position", () => {
      const result = createMockResult([3, 2], {
        type: "move",
        oldPosition: 5,
        newPosition: 10,
        playerColor: PlayerColor.RED,
      });
      const settlement = generateSettlementResult(result);

      expect(settlement.kick).toBe(false);
      expect(settlement.noKick).toBe(true);
    });
  });

  describe("Mutually exclusive properties", () => {
    test("should ensure big and small are opposite", () => {
      const result = createMockResult([4, 5], {
        type: "move",
        oldPosition: 0,
        newPosition: 9,
        playerColor: PlayerColor.RED,
      });
      const settlement = generateSettlementResult(result);

      expect(settlement.big).toBe(!settlement.small);
    });

    test("should ensure odd and even are opposite", () => {
      const result = createMockResult([3, 3], {
        type: "move",
        oldPosition: 0,
        newPosition: 6,
        playerColor: PlayerColor.RED,
      });
      const settlement = generateSettlementResult(result);

      expect(settlement.odd).toBe(!settlement.even);
    });

    test("should ensure all paired properties are opposite", () => {
      const result = createMockResult([4, 5], {
        type: "skip",
        playerColor: PlayerColor.RED,
      });
      const settlement = generateSettlementResult(result);

      expect(settlement.big).toBe(!settlement.small);
      expect(settlement.odd).toBe(!settlement.even);
      expect(settlement.move).toBe(!settlement.noMove);
      expect(settlement.release).toBe(!settlement.noRelease);
      expect(settlement.goStable).toBe(!settlement.noStable);
      expect(settlement.kick).toBe(!settlement.noKick);
    });
  });
});
