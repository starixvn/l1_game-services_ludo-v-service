import { PlaceBetConsumer } from "../../../src/event-consumers/place-bet-consumer.js";
import GameData from "../../../src/game-data.js";

jest.mock("sc-game-base", () => {
  const mockBaseClass = class MockPlaceBetConsumer {
    constructor() {}
    placeBet = jest.fn();
    getNoticeObj = jest.fn();
    definition: any;
  };

  return {
    Core: {
      BaseEventConsumers: {
        PlaceBetConsumer: mockBaseClass,
      },
    },
    Table: {
      TableGameData: class MockTableGameData {
        constructor() {}
        odds: any;
      },
    },
  };
});

describe("PlaceBetConsumer", () => {
  let consumer: PlaceBetConsumer;

  beforeEach(async () => {
    consumer = Object.create(PlaceBetConsumer.prototype);
    const { Core } = await import("sc-game-base");
    const mockBaseInstance = new (Core.BaseEventConsumers
      .PlaceBetConsumer as any)();
    Object.setPrototypeOf(Object.getPrototypeOf(consumer), mockBaseInstance);
    Object.assign(consumer, {
      definition: {
        choices: ["odd", "move"],
      } as any,
      gameData: {
        odds: {
          odd: 1.9,
          move: 0,
        },
      } as any,
    });
  });

  describe("composeBetChoiceValidationCriteria", () => {
    test("should return validation criteria", () => {
      // Act
      expect(consumer.composeBetChoiceValidationCriteria("odd")).toBeDefined();
    });

    test("should return validation criteria for invalid choice", () => {
      // Act
      expect(
        consumer.composeBetChoiceValidationCriteria("invalid"),
      ).toBeDefined();
    });

    test("should return failure for invalid choice", () => {
      // Act
      expect(
        consumer.composeBetChoiceValidationCriteria("invalid")[0].failure,
      ).toBe(true);
    });

    test("should return failure for invalid odds", () => {
      // Act
      expect(
        consumer.composeBetChoiceValidationCriteria("move")[1].failure,
      ).toBe(true);
    });
  });
});
