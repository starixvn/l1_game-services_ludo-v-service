import { roundSchema } from "./round-schema.js";

describe("roundSchema", () => {
  test("should be defined", () => {
    expect(roundSchema).toBeDefined();
  });

  test("should have all required fields defined", () => {
    const paths = roundSchema.paths;

    expect(paths.id).toBeDefined();
    expect(paths.result).toBeDefined();
    expect(paths.settlementResult).toBeDefined();
    expect(paths.time).toBeDefined();
    expect(paths.exchangeRateId).toBeDefined();
    expect(paths.initRoundId).toBeDefined();
  });

  test("should have correct field types", () => {
    const paths = roundSchema.paths;

    expect(paths.id.instance).toBe("Number");
    expect(paths.time.instance).toBe("Date");
    expect(paths.exchangeRateId.instance).toBe("Number");
    expect(paths.initRoundId.instance).toBe("Number");
  });

  test("id field should be required", () => {
    const paths = roundSchema.paths;

    expect(paths.id.isRequired).toBe(true);
  });

  test("result field should be required", () => {
    const paths = roundSchema.paths;

    expect(paths.result.isRequired).toBe(true);
  });

  test("settlementResult field should be required", () => {
    const paths = roundSchema.paths;

    expect(paths.settlementResult.isRequired).toBe(true);
  });

  test("time field should be required", () => {
    const paths = roundSchema.paths;

    expect(paths.time.isRequired).toBe(true);
  });

  test("exchangeRateId field should be required", () => {
    const paths = roundSchema.paths;

    expect(paths.exchangeRateId.isRequired).toBe(true);
  });

  test("initRoundId field should be optional", () => {
    const paths = roundSchema.paths;

    // Optional fields don't have isRequired set to true
    expect(paths.initRoundId.isRequired).not.toBe(true);
  });
});
