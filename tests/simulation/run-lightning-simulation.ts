import { PlayerColor } from "@rd/ludo-rules";
import { ODDS_KEYS } from "../../src/constants.js";
import { GenerateResultData } from "../../src/game-definition.js";
import { generateOdds } from "../../src/helpers/generate-odds.js";
import { generateResult } from "../../src/helpers/generate-result.js";
import { generateSettlementResult } from "../../src/helpers/generate-settlement-result.js";
import { generateDice } from "../../src/helpers/index.js";
import {
  calculateMultiplierFactor,
  createLightningConfig,
  generateLightningOdds,
  getEffectiveOdds,
} from "../../src/helpers/generate-lightning-odds.js";
import { IResult } from "../../src/models/interfaces/result.js";
import { ISettlementResult } from "../../src/models/interfaces/settlement-result.js";
import { Odds } from "../../src/types.js";
import {
  ILightningConfig,
  ILightningChoice,
} from "../../src/models/interfaces/lightning.js";
import { generateMarginsWithoutPrefix } from "../unit-test/__mock__/margins.js";

// ============================================================================
// Types
// ============================================================================

type OddsKey = keyof Odds;

interface ChoiceStats {
  totalBet: number;
  totalWin: number;
  wins: number;
  losses: number;
  lightningWins: number;
  lightningTotalWin: number;
}

interface ChoiceStatsWithRtp extends ChoiceStats {
  rtp: number;
  lightningRtp: number;
}

interface SimulationStats {
  totalRounds: number;
  totalBetAmount: number;
  totalWinAmount: number;
  rtp: number;
  choiceStats: Record<string, ChoiceStatsWithRtp>;
  lightningStats: {
    totalLightningRounds: number;
    lightningByMultiplier: Record<number, number>;
  };
}

interface SimulationConfig {
  rounds: number;
  margin: number;
  betAmount: number;
  lightningConfig: ILightningConfig;
  specificChoice?: OddsKey;
}

interface BetResult {
  totalBetAmount: number;
  totalWin: number;
  netWin: number;
  choiceResults: Record<
    string,
    {
      bet: number;
      win: number;
      won: boolean;
      isLightning: boolean;
      multiplier: number;
    }
  >;
}

// ============================================================================
// Constants
// ============================================================================

const FORMAT = {
  columnWidth: 12,
  choiceColumnWidth: 12,
  separatorLength: 100,
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

const initializeChoiceStats = (): Record<string, ChoiceStats> => {
  const stats: Record<string, ChoiceStats> = {};
  for (const key of ODDS_KEYS) {
    stats[key] = {
      totalBet: 0,
      totalWin: 0,
      wins: 0,
      losses: 0,
      lightningWins: 0,
      lightningTotalWin: 0,
    };
  }
  return stats;
};

const calculateRtp = (totalBet: number, totalWin: number): number => {
  return totalBet > 0 ? (totalWin / totalBet) * 100 : 0;
};

const addRtpToChoiceStats = (
  stats: Record<string, ChoiceStats>,
): Record<string, ChoiceStatsWithRtp> => {
  const result: Record<string, ChoiceStatsWithRtp> = {};
  for (const [key, choiceStats] of Object.entries(stats)) {
    result[key] = {
      ...choiceStats,
      rtp: calculateRtp(choiceStats.totalBet, choiceStats.totalWin),
      lightningRtp: calculateRtp(
        choiceStats.totalBet,
        choiceStats.lightningTotalWin,
      ),
    };
  }
  return result;
};

const createInitialGameData = (): GenerateResultData => ({
  currentBoardState: {
    [PlayerColor.RED]: [0, 0, 0, 0],
    [PlayerColor.GREEN]: [0, 0, 0, 0],
    [PlayerColor.YELLOW]: [0, 0, 0, 0],
    [PlayerColor.BLUE]: [0, 0, 0, 0],
  },
  currentPlayers: [
    PlayerColor.RED,
    PlayerColor.GREEN,
    PlayerColor.YELLOW,
    PlayerColor.BLUE,
  ],
  currentTurnIndex: Math.floor(Math.random() * 4),
  winners: [],
  dice: generateDice(),
});

/**
 * Reset game data when a winner is found
 */
const resetGameDataIfNeeded = (gameData: GenerateResultData): void => {
  if (gameData.winners.length > 0) {
    gameData.currentBoardState = {
      [PlayerColor.RED]: [0, 0, 0, 0],
      [PlayerColor.GREEN]: [0, 0, 0, 0],
      [PlayerColor.YELLOW]: [0, 0, 0, 0],
      [PlayerColor.BLUE]: [0, 0, 0, 0],
    };
    gameData.currentPlayers = [
      PlayerColor.RED,
      PlayerColor.GREEN,
      PlayerColor.YELLOW,
      PlayerColor.BLUE,
    ];
    gameData.currentTurnIndex = Math.floor(Math.random() * 4);
    gameData.winners = [];
  }
};

/**
 * Calculate bet result with lightning multipliers applied
 */
const calculateBetResult = (
  settlementResult: ISettlementResult,
  bets: Partial<Record<OddsKey, number>>,
  baseOdds: Odds,
  lightningChoices: ILightningChoice[],
): BetResult => {
  let totalBetAmount = 0;
  let totalWin = 0;
  const choiceResults: BetResult["choiceResults"] = {};

  // Create lightning lookup map
  const lightningMap = lightningChoices.reduce(
    (acc, lc) => ({ ...acc, [lc.choice]: lc.multiplier }),
    {} as Record<string, number>,
  );

  for (const [choice, betAmount] of Object.entries(bets)) {
    if (betAmount === 0 || betAmount === undefined) continue;

    const baseOddsValue = baseOdds[choice as OddsKey];
    if (baseOddsValue === 0) continue;

    const won = settlementResult[choice as keyof ISettlementResult];
    const isLightning = choice in lightningMap;
    const multiplier = lightningMap[choice] || 1;

    // Calculate effective odds (base × multiplier if lightning)
    const effectiveOdds = getEffectiveOdds(baseOdds, choice, lightningChoices);
    const winAmount = won ? betAmount * effectiveOdds : 0;

    totalBetAmount += betAmount;
    totalWin += winAmount;
    choiceResults[choice] = {
      bet: betAmount,
      win: winAmount,
      won,
      isLightning,
      multiplier,
    };
  }

  return {
    totalBetAmount,
    totalWin,
    netWin: totalWin - totalBetAmount,
    choiceResults,
  };
};

/**
 * Get bets - bet on all available choices or specific choice
 */
const getBets = (
  config: SimulationConfig,
  odds: Odds,
): Partial<Record<OddsKey, number>> => {
  const bets: Partial<Record<OddsKey, number>> = {};

  if (config.specificChoice) {
    if (odds[config.specificChoice] !== 0) {
      bets[config.specificChoice] = config.betAmount;
    }
  } else {
    // Bet on all available choices
    for (const key of ODDS_KEYS) {
      if (odds[key as OddsKey] !== 0) {
        bets[key as OddsKey] = config.betAmount;
      }
    }
  }

  return bets;
};

// ============================================================================
// Simulation Runner
// ============================================================================

const runSimulation = async (
  config: SimulationConfig,
): Promise<SimulationStats> => {
  printSimulationHeader(config);

  const gameData = createInitialGameData();
  let totalBetAmount = 0;
  let totalWinAmount = 0;
  const choiceStats = initializeChoiceStats();
  const lightningStats = {
    totalLightningRounds: 0,
    lightningByMultiplier: {} as Record<number, number>,
  };
  const progressInterval = Math.max(1, Math.floor(config.rounds / 10));

  for (let round = 1; round <= config.rounds; round++) {
    // Reset game if previous round had a winner
    resetGameDataIfNeeded(gameData);

    const preRoundResult: IResult = {
      board: gameData.currentBoardState,
      nextTurnIndex: gameData.currentTurnIndex,
      currentPlayers: gameData.currentPlayers,
      winners: gameData.winners,
      action: null as any,
      dice: [],
    };

    // Generate original odds (without lightning adjustment)
    const originalOdds = await generateOdds(
      generateMarginsWithoutPrefix(config.margin),
      preRoundResult,
    );

    // Apply lightning feature
    const { baseOdds, lightningChoices } = generateLightningOdds(
      originalOdds,
      config.lightningConfig,
    );

    // Track lightning statistics
    if (lightningChoices.length > 0) {
      lightningStats.totalLightningRounds++;
      for (const lc of lightningChoices) {
        lightningStats.lightningByMultiplier[lc.multiplier] =
          (lightningStats.lightningByMultiplier[lc.multiplier] || 0) + 1;
      }
    }

    // Get bets based on base odds (player sees adjusted odds)
    const bets = getBets(config, baseOdds);

    // Generate game result
    const dice = generateDice();
    gameData.dice = dice;
    const result = await generateResult(gameData);

    // Update game state
    gameData.currentBoardState = result.board;
    gameData.currentTurnIndex = result.nextTurnIndex;
    gameData.currentPlayers = result.currentPlayers;
    gameData.winners = result.winners;

    if (Object.keys(bets).length === 0) {
      continue;
    }

    // Calculate settlement
    const settlementResult = generateSettlementResult(result);
    const betResult = calculateBetResult(
      settlementResult,
      bets,
      baseOdds,
      lightningChoices,
    );

    totalBetAmount += betResult.totalBetAmount;
    totalWinAmount += betResult.totalWin;

    // Update choice stats
    for (const [choice, choiceResult] of Object.entries(
      betResult.choiceResults,
    )) {
      choiceStats[choice].totalBet += choiceResult.bet;
      choiceStats[choice].totalWin += choiceResult.win;

      if (choiceResult.won) {
        choiceStats[choice].wins++;
        if (choiceResult.isLightning) {
          choiceStats[choice].lightningWins++;
          choiceStats[choice].lightningTotalWin += choiceResult.win;
        }
      } else {
        choiceStats[choice].losses++;
      }
    }

    // Progress logging
    if (round % progressInterval === 0) {
      const currentRtp = calculateRtp(totalBetAmount, totalWinAmount);
      const progress = ((round / config.rounds) * 100).toFixed(1);
      console.log(
        `Progress: ${round}/${config.rounds} rounds (${progress}%) - Current RTP: ${currentRtp.toFixed(2)}%`,
      );
    }
  }

  return {
    totalRounds: config.rounds,
    totalBetAmount,
    totalWinAmount,
    rtp: calculateRtp(totalBetAmount, totalWinAmount),
    choiceStats: addRtpToChoiceStats(choiceStats),
    lightningStats,
  };
};

// ============================================================================
// Output Functions
// ============================================================================

const printSimulationHeader = (config: SimulationConfig): void => {
  const multiplierFactor = calculateMultiplierFactor(
    config.lightningConfig.multipliers,
  );

  console.log("\n" + "=".repeat(60));
  console.log("       LUDO LIGHTNING RTP SIMULATION");
  console.log("=".repeat(60));
  console.log(`Rounds: ${config.rounds}`);
  console.log(`Margin: ${(config.margin * 100).toFixed(2)}%`);
  console.log(`Bet Amount: ${config.betAmount}`);
  console.log(`Lightning Enabled: ${config.lightningConfig.enabled}`);

  if (config.lightningConfig.enabled) {
    console.log("\nLightning Multipliers:");
    for (const { multiplier, probability } of config.lightningConfig
      .multipliers) {
      console.log(
        `  x${multiplier}: ${(probability * 100).toFixed(2)}% probability`,
      );
    }
    console.log(`\nMultiplier Factor: ${multiplierFactor.toFixed(4)}`);
    console.log(`(Base odds will be divided by this factor)`);
  }

  if (config.specificChoice) {
    console.log(`\nSpecific Choice: ${config.specificChoice}`);
  }
  console.log("=".repeat(60) + "\n");
};

const printResults = (
  stats: SimulationStats,
  config: SimulationConfig,
): void => {
  const { columnWidth, separatorLength } = FORMAT;
  const multiplierFactor = calculateMultiplierFactor(
    config.lightningConfig.multipliers,
  );

  console.log("\n" + "=".repeat(60));
  console.log("         SIMULATION RESULTS");
  console.log("=".repeat(60));
  console.log(`Total Rounds: ${stats.totalRounds}`);
  console.log(`Total Bet Amount: ${stats.totalBetAmount.toFixed(2)}`);
  console.log(`Total Win Amount: ${stats.totalWinAmount.toFixed(2)}`);
  console.log(
    `Net Profit/Loss: ${(stats.totalWinAmount - stats.totalBetAmount).toFixed(2)}`,
  );
  console.log(`\n>>> OVERALL RTP: ${stats.rtp.toFixed(4)}% <<<`);

  // Lightning statistics
  if (config.lightningConfig.enabled) {
    console.log("\n--- Lightning Statistics ---");
    console.log(
      `Rounds with Lightning: ${stats.lightningStats.totalLightningRounds}`,
    );
    console.log(
      `Lightning Frequency: ${((stats.lightningStats.totalLightningRounds / stats.totalRounds) * 100).toFixed(2)}%`,
    );
    console.log("\nLightning Hits by Multiplier:");
    for (const [mult, count] of Object.entries(
      stats.lightningStats.lightningByMultiplier,
    )) {
      console.log(
        `  x${mult}: ${count} times (${((count / stats.totalRounds) * 100).toFixed(2)}%)`,
      );
    }
  }

  console.log("=".repeat(60) + "\n");

  // Per-choice statistics
  console.log("Per-Choice Statistics:");
  console.log("-".repeat(separatorLength));
  console.log(
    `${"Choice".padEnd(12)} | ` +
      `${"Total Bet".padStart(columnWidth)} | ` +
      `${"Total Win".padStart(columnWidth)} | ` +
      `${"Wins".padStart(8)} | ` +
      `${"L-Wins".padStart(8)} | ` +
      `${"RTP %".padStart(10)} | ` +
      `${"Expected".padStart(10)}`,
  );
  console.log("-".repeat(separatorLength));

  // Calculate expected RTP for comparison
  const expectedRtp = (1 - config.margin) * 100;

  for (const [choice, choiceStats] of Object.entries(stats.choiceStats)) {
    if (choiceStats.totalBet > 0) {
      console.log(
        `${choice.padEnd(12)} | ` +
          `${choiceStats.totalBet.toFixed(2).padStart(columnWidth)} | ` +
          `${choiceStats.totalWin.toFixed(2).padStart(columnWidth)} | ` +
          `${choiceStats.wins.toString().padStart(8)} | ` +
          `${choiceStats.lightningWins.toString().padStart(8)} | ` +
          `${choiceStats.rtp.toFixed(4).padStart(10)} | ` +
          `${expectedRtp.toFixed(4).padStart(10)}`,
      );
    }
  }
  console.log("-".repeat(separatorLength));

  // Summary
  console.log("\n--- RTP Analysis ---");
  console.log(`Expected RTP (from margin): ${expectedRtp.toFixed(4)}%`);
  console.log(`Actual RTP: ${stats.rtp.toFixed(4)}%`);
  console.log(`Difference: ${(stats.rtp - expectedRtp).toFixed(4)}%`);

  if (config.lightningConfig.enabled) {
    console.log(`\nMultiplier Factor Applied: ${multiplierFactor.toFixed(4)}`);
    console.log(
      "Note: Lightning multipliers should NOT affect overall RTP significantly",
    );
    console.log(
      "(Variance will increase, but expected value remains the same)",
    );
  }
};

const printHelp = (): void => {
  console.log(`
Ludo Lightning RTP Simulation

Usage: npx tsx tests/simulation/run-lightning-simulation.ts [options]

Options:
  -r, --rounds <number>     Number of rounds to simulate (default: 10000)
  -m, --margin <number>     House margin, 0-1 (default: 0.04 for 96% RTP)
  -b, --bet <number>        Bet amount per choice (default: 100)
  -c, --choice <name>       Specific choice to bet on (default: all)
  --x2 <probability>        Probability for x2 multiplier (default: 0.08)
  --x3 <probability>        Probability for x3 multiplier (default: 0)
  --x5 <probability>        Probability for x5 multiplier (default: 0)
  --x6 <probability>        Probability for x6 multiplier (default: 0.05)
  --no-lightning            Disable lightning feature
  -h, --help                Show this help message

Examples:
  # Run with default lightning settings (x2=8%, x6=5%)
  npx tsx tests/simulation/run-lightning-simulation.ts

  # Run without lightning to compare baseline RTP
  npx tsx tests/simulation/run-lightning-simulation.ts --no-lightning

  # Custom lightning probabilities
  npx tsx tests/simulation/run-lightning-simulation.ts --x2 0.10 --x6 0.03

  # Test specific choice with lightning
  npx tsx tests/simulation/run-lightning-simulation.ts -c even -r 50000

  # High margin test
  npx tsx tests/simulation/run-lightning-simulation.ts -m 0.10 -r 100000
`);
};

// ============================================================================
// Argument Parsing
// ============================================================================

const parseArgs = (args: string[]): SimulationConfig => {
  const config: SimulationConfig = {
    rounds: 10000,
    margin: 0.04, // 96% RTP
    betAmount: 100,
    lightningConfig: createLightningConfig(true, { 2: 0.08, 6: 0.05 }),
  };

  let lightningEnabled = true;
  const multiplierProbs: Record<number, number> = { 2: 0.08, 6: 0.05 };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "--rounds":
      case "-r":
        config.rounds = parseInt(nextArg, 10);
        i++;
        break;

      case "--margin":
      case "-m":
        config.margin = parseFloat(nextArg);
        i++;
        break;

      case "--bet":
      case "-b":
        config.betAmount = parseFloat(nextArg);
        i++;
        break;

      case "--choice":
      case "-c":
        config.specificChoice = nextArg as OddsKey;
        i++;
        break;

      case "--x2":
        multiplierProbs[2] = parseFloat(nextArg);
        i++;
        break;

      case "--x3":
        multiplierProbs[3] = parseFloat(nextArg);
        i++;
        break;

      case "--x5":
        multiplierProbs[5] = parseFloat(nextArg);
        i++;
        break;

      case "--x6":
        multiplierProbs[6] = parseFloat(nextArg);
        i++;
        break;

      case "--no-lightning":
        lightningEnabled = false;
        break;

      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
    }
  }

  // Filter out zero probabilities
  const filteredProbs: Record<number, number> = {};
  for (const [mult, prob] of Object.entries(multiplierProbs)) {
    if (prob > 0) {
      filteredProbs[Number(mult)] = prob;
    }
  }

  config.lightningConfig = createLightningConfig(
    lightningEnabled,
    filteredProbs,
  );

  return config;
};

// ============================================================================
// Main
// ============================================================================

const main = async (): Promise<void> => {
  try {
    const args = process.argv.slice(2);
    const config = parseArgs(args);

    const stats = await runSimulation(config);
    printResults(stats, config);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Simulation failed:", errorMessage);
    process.exit(1);
  }
};

main();
