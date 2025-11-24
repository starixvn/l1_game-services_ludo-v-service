import { betSchema } from "./bet-schema.js";

describe("betSchema", () => {
  test("should be defined", () => {
    expect(betSchema).toBeDefined();
  });

  test("should have required fields defined", () => {
    const paths = betSchema.paths;

    expect(paths.uid).toBeDefined();
    expect(paths.name).toBeDefined();
    expect(paths.totalAmount).toBeDefined();
    expect(paths.betwin).toBeDefined();
    expect(paths.time).toBeDefined();
    expect(paths.odds).toBeDefined();
    expect(paths.roundId).toBeDefined();
    expect(paths.currency).toBeDefined();
    expect(paths.playerId).toBeDefined();
    expect(paths.siteId).toBeDefined();
    expect(paths.rate).toBeDefined();
    expect(paths.operatorId).toBeDefined();
    expect(paths.margin).toBeDefined();
  });

  test("should have all bet choice fields", () => {
    const paths = betSchema.paths;

    expect(paths.big).toBeDefined();
    expect(paths.small).toBeDefined();
    expect(paths.odd).toBeDefined();
    expect(paths.even).toBeDefined();
    expect(paths.kick).toBeDefined();
    expect(paths.move).toBeDefined();
    expect(paths.release).toBeDefined();
    expect(paths.goStable).toBeDefined();
    expect(paths.noStable).toBeDefined();
    expect(paths.noKick).toBeDefined();
    expect(paths.noMove).toBeDefined();
    expect(paths.noRelease).toBeDefined();
  });

  test("should have correct field types", () => {
    const paths = betSchema.paths;

    expect(paths.uid.instance).toBe("String");
    expect(paths.name.instance).toBe("String");
    expect(paths.totalAmount.instance).toBe("Number");
    expect(paths.betwin.instance).toBe("Number");
    expect(paths.time.instance).toBe("Date");
    expect(paths.roundId.instance).toBe("Number");
    expect(paths.paid.instance).toBe("Boolean");
    expect(paths.freeBet.instance).toBe("Boolean");
  });

  test("should have default values for boolean fields", () => {
    const paths = betSchema.paths;

    expect(paths.paid.defaultValue).toBe(false);
    expect(paths.freeBet.defaultValue).toBe(false);
    expect(paths.reachMaxWin.defaultValue).toBe(false);
  });

  test("should have default value for maxWin", () => {
    const paths = betSchema.paths;

    expect(paths.maxWin.defaultValue).toBe(0);
  });

  test("uid field should be required", () => {
    const paths = betSchema.paths;

    expect(paths.uid.isRequired).toBe(true);
  });

  test("name field should be required", () => {
    const paths = betSchema.paths;

    expect(paths.name.isRequired).toBe(true);
  });

  test("roundId field should be required", () => {
    const paths = betSchema.paths;

    expect(paths.roundId.isRequired).toBe(true);
  });

  test("currency field should be required", () => {
    const paths = betSchema.paths;

    expect(paths.currency.isRequired).toBe(true);
  });

  test("rate field should be required", () => {
    const paths = betSchema.paths;

    expect(paths.rate.isRequired).toBe(true);
  });

  test("margin field should be required", () => {
    const paths = betSchema.paths;

    expect(paths.margin.isRequired).toBe(true);
  });

  test("bet choice fields should be optional Number type", () => {
    const betChoiceFields = [
      "big",
      "small",
      "odd",
      "even",
      "kick",
      "move",
      "release",
      "goStable",
      "noStable",
      "noKick",
      "noMove",
      "noRelease",
    ];

    betChoiceFields.forEach((field) => {
      const path = betSchema.paths[field];
      expect(path).toBeDefined();
      expect(path.instance).toBe("Number");
      // Optional fields don't have isRequired set to true
      expect(path.isRequired).not.toBe(true);
    });
  });
});
