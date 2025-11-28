import { ruleBotInstance } from "../../../src/helpers/rule-bot-instance.ts";

describe("ruleBotInstance", () => {
  it("should be defined", () => {
    expect(ruleBotInstance).toBeDefined();

    expect(ruleBotInstance.move).toBeDefined();
    expect(ruleBotInstance.move).toBeInstanceOf(Function);
  });
});
