import { GAME_NAME, ODDS_KEYS } from "./constants.js";

describe("Constants", () => {
  describe("GAME_NAME", () => {
    test("should be defined", () => {
      expect(GAME_NAME).toBeDefined();
    });

    test("should equal 'ludo'", () => {
      expect(GAME_NAME).toBe("ludo");
    });

    test("should be a string", () => {
      expect(typeof GAME_NAME).toBe("string");
    });
  });

  describe("ODDS_KEYS", () => {
    test("should be defined", () => {
      expect(ODDS_KEYS).toBeDefined();
    });

    test("should be an array", () => {
      expect(Array.isArray(ODDS_KEYS)).toBe(true);
    });

    test("should have exactly 12 elements", () => {
      expect(ODDS_KEYS).toHaveLength(12);
    });

    test("should contain all dice-related keys", () => {
      expect(ODDS_KEYS).toContain("big");
      expect(ODDS_KEYS).toContain("small");
      expect(ODDS_KEYS).toContain("odd");
      expect(ODDS_KEYS).toContain("even");
    });

    test("should contain all action-related keys", () => {
      expect(ODDS_KEYS).toContain("kick");
      expect(ODDS_KEYS).toContain("noKick");
      expect(ODDS_KEYS).toContain("move");
      expect(ODDS_KEYS).toContain("noMove");
      expect(ODDS_KEYS).toContain("release");
      expect(ODDS_KEYS).toContain("noRelease");
      expect(ODDS_KEYS).toContain("goStable");
      expect(ODDS_KEYS).toContain("noStable");
    });

    test("should have unique values", () => {
      const uniqueKeys = new Set(ODDS_KEYS);
      expect(uniqueKeys.size).toBe(ODDS_KEYS.length);
    });

    test("all elements should be strings", () => {
      ODDS_KEYS.forEach(key => {
        expect(typeof key).toBe("string");
      });
    });

    test("should match expected order", () => {
      const expectedOrder = [
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

      expect(ODDS_KEYS).toEqual(expectedOrder);
    });
  });
});
