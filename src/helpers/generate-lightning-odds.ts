import { secureRandomFloat } from "sc-core-rng";
import { ODDS_KEYS } from "../constants.js";
import {
  ILightningChoice,
  ILightningConfig,
  ILightningMultiplier,
  ILightningOddsResult,
} from "../models/interfaces/lightning.js";
import { Odds } from "../types.js";

/**
 * Calculate the multiplier factor based on lightning configuration
 *
 * Formula: multiplier_factor = 1 + Σ(probability_i × (multiplier_i - 1))
 *
 * Example:
 *   x6 prob = 5%, x2 prob = 8%
 *   factor = 1 + (0.05 × (6-1)) + (0.08 × (2-1))
 *   factor = 1 + 0.25 + 0.08 = 1.33
 */
export const calculateMultiplierFactor = (
  multipliers: ILightningMultiplier[],
): number => {
  const additionalFactor = multipliers.reduce(
    (sum, { multiplier, probability }) => {
      return sum + probability * (multiplier - 1);
    },
    0,
  );

  return 1 + additionalFactor;
};

/**
 * Select a lightning multiplier based on configured probabilities
 * Returns null if no lightning is triggered (normal round)
 */
export const selectLightningMultiplier = (
  multipliers: ILightningMultiplier[],
): number | null => {
  const random = secureRandomFloat();
  let cumulativeProbability = 0;

  for (const { multiplier, probability } of multipliers) {
    cumulativeProbability += probability;
    if (random < cumulativeProbability) {
      return multiplier;
    }
  }

  // No lightning triggered (normal odds)
  return null;
};

/**
 * Generate lightning choices for eligible bet options
 * Each eligible choice independently rolls for lightning
 */
export const generateLightningChoices = (
  config: ILightningConfig,
  eligibleChoices: string[],
): ILightningChoice[] => {
  if (!config.enabled || eligibleChoices.length === 0) {
    return [];
  }

  const lightningChoices: ILightningChoice[] = [];

  for (const choice of eligibleChoices) {
    const multiplier = selectLightningMultiplier(config.multipliers);
    if (multiplier !== null) {
      lightningChoices.push({ choice, multiplier });
    }
  }

  return lightningChoices;
};

/**
 * Adjust base odds to maintain target RTP when lightning multipliers are applied
 *
 * Formula:
 *   adjusted_odds = original_odds / multiplier_factor
 *
 * This ensures that:
 *   Expected Payout = adjusted_odds × multiplier_factor = original_odds
 *   RTP remains constant regardless of lightning
 *
 * Note: We use 4 decimal places for precision, then round to 2 for display
 */
export const adjustOddsForLightning = (
  originalOdds: Odds,
  multiplierFactor: number,
): Odds => {
  return ODDS_KEYS.reduce((acc, key) => {
    const originalValue = originalOdds[key as keyof Odds];
    // Keep higher precision (4 decimal places) to minimize rounding errors
    acc[key as keyof Odds] =
      originalValue > 0
        ? Math.round((originalValue / multiplierFactor) * 10000) / 10000
        : 0;
    return acc;
  }, {} as Odds);
};

/**
 * Generate lightning odds for a round
 *
 * This function:
 * 1. Calculates the multiplier factor from config
 * 2. Adjusts base odds to maintain RTP
 * 3. Generates lightning choices for eligible options
 *
 * @param originalOdds - The original odds calculated without lightning
 * @param config - Lightning configuration with multipliers and probabilities
 * @returns Lightning odds result with adjusted base odds and lightning choices
 */
export const generateLightningOdds = (
  originalOdds: Odds,
  config: ILightningConfig,
): ILightningOddsResult => {
  if (!config.enabled) {
    return {
      baseOdds: originalOdds,
      lightningChoices: [],
      multiplierFactor: 1,
    };
  }

  // Calculate multiplier factor for RTP adjustment
  const multiplierFactor = calculateMultiplierFactor(config.multipliers);

  // Adjust base odds to maintain target RTP
  const baseOdds = adjustOddsForLightning(originalOdds, multiplierFactor);

  // Get eligible choices (odds > 0)
  const eligibleChoices = ODDS_KEYS.filter(
    (key) => originalOdds[key as keyof Odds] > 0,
  );

  // Generate lightning choices for this round
  const lightningChoices = generateLightningChoices(config, eligibleChoices);

  return {
    baseOdds,
    lightningChoices,
    multiplierFactor,
  };
};

/**
 * Calculate the effective odds for a choice considering lightning
 *
 * @param baseOdds - The adjusted base odds
 * @param choice - The bet choice
 * @param lightningChoices - Lightning choices for this round
 * @returns Effective odds (base × multiplier if lightning, otherwise base)
 */
export const getEffectiveOdds = (
  baseOdds: Odds,
  choice: string,
  lightningChoices: ILightningChoice[],
): number => {
  const base = baseOdds[choice as keyof Odds] || 0;
  const lightning = lightningChoices.find((lc) => lc.choice === choice);

  if (lightning) {
    // Use higher precision (4 decimal places) to minimize rounding errors
    return Math.round(base * lightning.multiplier * 10000) / 10000;
  }

  return base;
};

/**
 * Create a lightning config from simple parameters
 *
 * @param enabled - Whether lightning is enabled
 * @param multiplierProbabilities - Map of multiplier to probability, e.g., { 2: 0.08, 6: 0.05 }
 * @returns Lightning configuration
 */
export const createLightningConfig = (
  enabled: boolean,
  multiplierProbabilities: Record<number, number>,
): ILightningConfig => {
  const multipliers: ILightningMultiplier[] = Object.entries(
    multiplierProbabilities,
  ).map(([mult, prob]) => ({
    multiplier: Number(mult),
    probability: prob,
  }));

  return {
    enabled,
    multipliers,
  };
};
