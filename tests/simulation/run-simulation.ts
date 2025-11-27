import { PlayerColor } from "@rd/ludo-rules";
import { ODDS_KEYS } from "../../src/constants.js";
import { GenerateResultData } from "../../src/game-definition.js";
import { generateOdds } from "../../src/helpers/generate-odds.js";
import { generateResult } from "../../src/helpers/generate-result.js";
import { generateSettlementResult } from "../../src/helpers/generate-settlement-result.js";
import { generateDice } from "../../src/helpers/index.js";
import { IResult } from "../../src/models/interfaces/result.js";
import { ISettlementResult } from "../../src/models/interfaces/settlement-result";
import { Odds } from "../../src/types.js";

const BETTING_CHOICES = {
  dice: ["big", "small", "odd", "even"] as const,
  actions: [
    "kick",
    "noKick",
    "move",
    "noMove",
    "release",
    "noRelease",
    "goStable",
    "noStable",
  ] as const,
  oneSide: ["big", "odd", "kick", "move", "release", "goStable"] as const,
  pairs: [
    ["big", "small"],
    ["odd", "even"],
    ["kick", "noKick"],
    ["move", "noMove"],
    ["release", "noRelease"],
    ["goStable", "noStable"],
  ] as const,
} as const;

const FORMAT = {
  columnWidth: 12,
  choiceColumnWidth: 12,
  separatorLength: 80,
} as const;

const BETTING_STRATEGIES = [
  "all",
  "single",
  "random",
  "dice-only",
  "action-only",
  "one-side",
  "random-side",
] as const;

type BettingStrategy = (typeof BETTING_STRATEGIES)[number];
type OddsKey = keyof Odds;

interface ChoiceStats {
  totalBet: number;
  totalWin: number;
  wins: number;
  losses: number;
}

interface ChoiceStatsWithRtp extends ChoiceStats {
  rtp: number;
}

interface SimulationStats {
  totalRounds: number;
  totalBetAmount: number;
  totalWinAmount: number;
  rtp: number;
  choiceStats: Record<string, ChoiceStatsWithRtp>;
}

interface SimulationConfig {
  rounds: number;
  margin: number;
  betAmount: number;
  bettingStrategy: BettingStrategy;
  specificChoice?: OddsKey;
}

interface BetResult {
  totalBetAmount: number;
  totalWin: number;
  netWin: number;
  choiceResults: Record<string, { bet: number; win: number; won: boolean }>;
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const validateConfig = (config: SimulationConfig): void => {
  if (config.rounds <= 0 || !Number.isInteger(config.rounds)) {
    throw new ValidationError(
      `Invalid rounds: ${config.rounds}. Must be a positive integer.`,
    );
  }

  if (config.margin < 0 || config.margin > 1) {
    throw new ValidationError(
      `Invalid margin: ${config.margin}. Must be between 0 and 1.`,
    );
  }

  if (config.betAmount <= 0) {
    throw new ValidationError(
      `Invalid bet amount: ${config.betAmount}. Must be greater than 0.`,
    );
  }

  if (!BETTING_STRATEGIES.includes(config.bettingStrategy)) {
    throw new ValidationError(
      `Invalid betting strategy: ${config.bettingStrategy}. ` +
        `Valid options: ${BETTING_STRATEGIES.join(", ")}`,
    );
  }

  if (config.bettingStrategy === "single" && !config.specificChoice) {
    throw new ValidationError(
      "Single strategy requires --choice (-c) to be specified.",
    );
  }

  if (
    config.specificChoice &&
    !ODDS_KEYS.includes(config.specificChoice as string)
  ) {
    throw new ValidationError(
      `Invalid choice: ${config.specificChoice}. ` +
        `Valid options: ${ODDS_KEYS.join(", ")}`,
    );
  }
};

const initializeChoiceStats = (): Record<string, ChoiceStats> => {
  const stats: Record<string, ChoiceStats> = {};
  for (const key of ODDS_KEYS) {
    stats[key] = { totalBet: 0, totalWin: 0, wins: 0, losses: 0 };
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

const calculateBetResult = (
  settlementResult: ISettlementResult,
  bets: Partial<Record<OddsKey, number>>,
  odds: Odds,
): BetResult => {
  let totalBetAmount = 0;
  let totalWin = 0;
  const choiceResults: BetResult["choiceResults"] = {};

  for (const [choice, betAmount] of Object.entries(bets)) {
    if (betAmount === 0 || betAmount === undefined) continue;

    const oddsValue = odds[choice as OddsKey];
    if (oddsValue === null) continue;

    const won = settlementResult[choice as keyof ISettlementResult];
    const winAmount = won ? betAmount * oddsValue : 0;

    totalBetAmount += betAmount;
    totalWin += winAmount;
    choiceResults[choice] = { bet: betAmount, win: winAmount, won };
  }

  return {
    totalBetAmount,
    totalWin,
    netWin: totalWin - totalBetAmount,
    choiceResults,
  };
};

const getBets = (
  config: SimulationConfig,
  odds: Odds,
): Partial<Record<OddsKey, number>> => {
  const bets: Partial<Record<OddsKey, number>> = {};

  const addBetIfAvailable = (key: string): void => {
    if (odds[key as OddsKey] !== null) {
      bets[key as OddsKey] = config.betAmount;
    }
  };

  switch (config.bettingStrategy) {
    case "all":
      ODDS_KEYS.forEach(addBetIfAvailable);
      break;

    case "single":
      if (config.specificChoice) {
        addBetIfAvailable(config.specificChoice);
      }
      break;

    case "random": {
      const availableChoices = ODDS_KEYS.filter(
        (key) => odds[key as OddsKey] !== null,
      );
      if (availableChoices.length > 0) {
        const randomChoice =
          availableChoices[Math.floor(Math.random() * availableChoices.length)];
        addBetIfAvailable(randomChoice);
      }
      break;
    }

    case "dice-only":
      BETTING_CHOICES.dice.forEach(addBetIfAvailable);
      break;

    case "action-only":
      BETTING_CHOICES.actions.forEach(addBetIfAvailable);
      break;

    case "one-side":
      BETTING_CHOICES.oneSide.forEach(addBetIfAvailable);
      break;

    case "random-side":
      for (const [choice1, choice2] of BETTING_CHOICES.pairs) {
        const pick = Math.random() < 0.5 ? choice1 : choice2;
        addBetIfAvailable(pick);
      }
      break;
  }

  return bets;
};

const runSimulation = async (
  config: SimulationConfig,
): Promise<SimulationStats> => {
  printSimulationHeader(config);

  const gameData = createInitialGameData();
  let totalBetAmount = 0;
  let totalWinAmount = 0;
  const choiceStats = initializeChoiceStats();
  const progressInterval = Math.max(1, Math.floor(config.rounds / 10));

  for (let round = 1; round <= config.rounds; round++) {
    const preRoundResult: IResult = {
      board: gameData.currentBoardState,
      nextTurnIndex: gameData.currentTurnIndex,
      currentPlayers: gameData.currentPlayers,
      winners: gameData.winners,
      action: null as any,
      dice: [],
    };

    const odds = await generateOdds(config.margin, preRoundResult);
    const bets = getBets(config, odds);
    const dice = generateDice();
    gameData.dice = dice;
    const result = await generateResult(gameData);

    gameData.currentBoardState = result.board;
    gameData.currentTurnIndex = result.nextTurnIndex;
    gameData.currentPlayers = result.currentPlayers;
    gameData.winners = result.winners;

    if (Object.keys(bets).length === 0) {
      continue;
    }

    const settlementResult = generateSettlementResult(result);
    const betResult = calculateBetResult(settlementResult, bets, odds);

    totalBetAmount += betResult.totalBetAmount;
    totalWinAmount += betResult.totalWin;

    for (const [choice, choiceResult] of Object.entries(
      betResult.choiceResults,
    )) {
      choiceStats[choice].totalBet += choiceResult.bet;
      choiceStats[choice].totalWin += choiceResult.win;
      if (choiceResult.won) {
        choiceStats[choice].wins++;
      } else {
        choiceStats[choice].losses++;
      }
    }

    if (round % progressInterval === 0) {
      const currentRtp = calculateRtp(totalBetAmount, totalWinAmount);
      const progress = ((round / config.rounds) * 100).toFixed(1);
      console.log(
        `Progress: ${round}/${
          config.rounds
        } rounds (${progress}%) - Current RTP: ${currentRtp.toFixed(2)}%`,
      );
    }
  }

  return {
    totalRounds: config.rounds,
    totalBetAmount,
    totalWinAmount,
    rtp: calculateRtp(totalBetAmount, totalWinAmount),
    choiceStats: addRtpToChoiceStats(choiceStats),
  };
};

const printSimulationHeader = (config: SimulationConfig): void => {
  console.log("\n========================================");
  console.log("       LUDO RTP SIMULATION");
  console.log("========================================");
  console.log(`Rounds: ${config.rounds}`);
  console.log(`Margin: ${config.margin}`);
  console.log(`Bet Amount: ${config.betAmount}`);
  console.log(`Strategy: ${config.bettingStrategy}`);
  if (config.specificChoice) {
    console.log(`Specific Choice: ${config.specificChoice}`);
  }
  console.log("========================================\n");
};

const printResults = (stats: SimulationStats): void => {
  const { columnWidth, choiceColumnWidth, separatorLength } = FORMAT;

  console.log("\n========================================");
  console.log("         SIMULATION RESULTS");
  console.log("========================================");
  console.log(`Total Rounds: ${stats.totalRounds}`);
  console.log(`Total Bet Amount: ${stats.totalBetAmount.toFixed(2)}`);
  console.log(`Total Win Amount: ${stats.totalWinAmount.toFixed(2)}`);
  console.log(
    `Net Profit/Loss: ${(stats.totalWinAmount - stats.totalBetAmount).toFixed(
      2,
    )}`,
  );
  console.log(`\n>>> OVERALL RTP: ${stats.rtp.toFixed(4)}% <<<`);
  console.log("========================================\n");

  console.log("Per-Choice Statistics:");
  console.log("-".repeat(separatorLength));
  console.log(
    `${"Choice".padEnd(choiceColumnWidth)} | ` +
      `${"Total Bet".padStart(columnWidth)} | ` +
      `${"Total Win".padStart(columnWidth)} | ` +
      `${"Wins".padStart(8)} | ` +
      `${"Losses".padStart(8)} | ` +
      `${"RTP %".padStart(10)}`,
  );
  console.log("-".repeat(separatorLength));

  for (const [choice, choiceStats] of Object.entries(stats.choiceStats)) {
    if (choiceStats.totalBet > 0) {
      console.log(
        `${choice.padEnd(choiceColumnWidth)} | ` +
          `${choiceStats.totalBet.toFixed(2).padStart(columnWidth)} | ` +
          `${choiceStats.totalWin.toFixed(2).padStart(columnWidth)} | ` +
          `${choiceStats.wins.toString().padStart(8)} | ` +
          `${choiceStats.losses.toString().padStart(8)} | ` +
          `${choiceStats.rtp.toFixed(4).padStart(10)}`,
      );
    }
  }
  console.log("-".repeat(separatorLength));
};

const printHelp = (): void => {
  console.log(`
Ludo RTP Simulation

Usage: npx tsx tests/simulation/run-simulation.ts [options]

Options:
  -r, --rounds <number>    Number of rounds to simulate (default: 10000)
  -m, --margin <number>    House margin, 0-1 (default: 0.05)
  -b, --bet <number>       Bet amount per choice (default: 100)
  -s, --strategy <type>    Betting strategy (default: all)
                           Options: ${BETTING_STRATEGIES.join(", ")}
  -c, --choice <name>      Specific choice for 'single' strategy
                           Options: ${ODDS_KEYS.join(", ")}
  -h, --help               Show this help message

Betting Strategies:
  all          - Bet on all available choices
  single       - Bet on a single specific choice (requires -c)
  random       - Randomly pick one choice per round
  dice-only    - Bet only on dice outcomes (big, small, odd, even)
  action-only  - Bet only on action outcomes (kick, move, release, goStable)
  one-side     - Bet on positive side of each pair
  random-side  - Randomly pick one side of each pair per round

Examples:
  # Run with default settings (10000 rounds, 5% margin, bet on all choices)
  npx tsx tests/simulation/run-simulation.ts

  # Run 50000 rounds with 3% margin
  npx tsx tests/simulation/run-simulation.ts -r 50000 -m 0.03

  # Test only dice-based bets
  npx tsx tests/simulation/run-simulation.ts -s dice-only

  # Test a single specific choice
  npx tsx tests/simulation/run-simulation.ts -s single -c big

  # Realistic player behavior (random side of each pair)
  npx tsx tests/simulation/run-simulation.ts -s random-side
`);
};

const parseArgs = (args: string[]): SimulationConfig => {
  const config: SimulationConfig = {
    rounds: 10000,
    margin: 0.05,
    betAmount: 100,
    bettingStrategy: "all",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "--rounds":
      case "-r":
        if (!nextArg) throw new ValidationError("Missing value for --rounds");
        config.rounds = parseInt(nextArg, 10);
        if (isNaN(config.rounds)) {
          throw new ValidationError(`Invalid rounds value: ${nextArg}`);
        }
        i++;
        break;

      case "--margin":
      case "-m":
        if (!nextArg) throw new ValidationError("Missing value for --margin");
        config.margin = parseFloat(nextArg);
        if (isNaN(config.margin)) {
          throw new ValidationError(`Invalid margin value: ${nextArg}`);
        }
        i++;
        break;

      case "--bet":
      case "-b":
        if (!nextArg) throw new ValidationError("Missing value for --bet");
        config.betAmount = parseFloat(nextArg);
        if (isNaN(config.betAmount)) {
          throw new ValidationError(`Invalid bet amount value: ${nextArg}`);
        }
        i++;
        break;

      case "--strategy":
      case "-s":
        if (!nextArg) throw new ValidationError("Missing value for --strategy");
        config.bettingStrategy = nextArg as BettingStrategy;
        i++;
        break;

      case "--choice":
      case "-c":
        if (!nextArg) throw new ValidationError("Missing value for --choice");
        config.specificChoice = nextArg as OddsKey;
        i++;
        break;

      case "--help":
      case "-h":
        printHelp();
        process.exit(0);

      default:
        if (arg.startsWith("-")) {
          throw new ValidationError(`Unknown option: ${arg}`);
        }
    }
  }

  return config;
};

const main = async (): Promise<void> => {
  try {
    const args = process.argv.slice(2);
    const config = parseArgs(args);
    validateConfig(config);

    const stats = await runSimulation(config);
    printResults(stats);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`Validation error: ${error.message}`);
      console.error("\nRun with --help for usage information.");
      process.exit(1);
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("Simulation failed:", errorMessage);
    if (errorStack) {
      console.error("\nStack trace:");
      console.error(errorStack);
    }
    process.exit(1);
  }
};

main();
