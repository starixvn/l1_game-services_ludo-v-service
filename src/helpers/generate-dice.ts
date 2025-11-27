import { secureRandomRange } from "sc-core-rng";

export const generateDice = (): number[] => {
  return [secureRandomRange(1, 6), secureRandomRange(1, 6)];
};
