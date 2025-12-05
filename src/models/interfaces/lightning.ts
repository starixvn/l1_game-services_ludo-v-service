/**
 * Lightning Feature Types
 *
 * Math Model:
 * When lightning multipliers are applied, the base odds must be adjusted
 * to maintain the target RTP.
 *
 * Formula:
 *   base_odds = target_payout / multiplier_factor
 *
 * Where:
 *   multiplier_factor = 1 + Σ(lightning_prob_i × (multiplier_i - 1))
 *
 * Example:
 *   target_payout = 1.92 (for 96% RTP with 50% win probability)
 *   x6 probability = 5%, x2 probability = 8%
 *   multiplier_factor = 1 + (0.05 × 5) + (0.08 × 1) = 1.33
 *   base_odds = 1.92 / 1.33 = 1.44
 */

export interface ILightningMultiplier {
  multiplier: number; // e.g., 2, 3, 5, 6
  probability: number; // e.g., 0.05 for 5%
}

export interface ILightningConfig {
  enabled: boolean;
  multipliers: ILightningMultiplier[]; // Available multipliers with probabilities
}

export interface ILightningChoice {
  choice: string; // e.g., "big", "kick"
  multiplier: number; // e.g., 2, 3, 5, 6
}

export interface ILightningOddsResult {
  baseOdds: Record<string, number>; // Adjusted base odds for each choice
  lightningChoices: ILightningChoice[]; // Selected lightning choices for this round
  multiplierFactor: number; // The factor used to adjust odds
}
