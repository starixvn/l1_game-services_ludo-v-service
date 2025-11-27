import { generateDice } from "../../../src/helpers/index.ts";

describe("generateDice", () => {
  test("should generate two dice with values between 1 and 6", () => {
    // Act
    const dice = generateDice();

    // Assert
    expect(dice).toHaveLength(2);
    expect(dice[0]).toBeGreaterThanOrEqual(1);
    expect(dice[0]).toBeLessThanOrEqual(6);
    expect(dice[1]).toBeGreaterThanOrEqual(1);
    expect(dice[1]).toBeLessThanOrEqual(6);
  });
});
