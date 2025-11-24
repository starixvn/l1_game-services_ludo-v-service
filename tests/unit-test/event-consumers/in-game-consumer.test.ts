import { InGameConsumer } from "../../../src/event-consumers/in-game-consumer.js";

describe("InGameConsumer", () => {
  test("should be defined", () => {
    expect(InGameConsumer).toBeDefined();
  });

  test("should extend from base class", () => {
    expect(InGameConsumer.prototype.buildPayload).toBeDefined();
    expect(InGameConsumer.prototype.generateRoundData).toBeDefined();
  });

  test("should have async buildPayload method", () => {
    const method = InGameConsumer.prototype.buildPayload;
    expect(method).toBeDefined();
    expect(method.constructor.name).toBe("AsyncFunction");
  });

  test("should have async generateRoundData method", () => {
    const method = InGameConsumer.prototype.generateRoundData;
    expect(method).toBeDefined();
    expect(method.constructor.name).toBe("AsyncFunction");
  });
});
