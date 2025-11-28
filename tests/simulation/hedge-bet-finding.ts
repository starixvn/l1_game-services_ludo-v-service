import {
  DiceState,
  getActions,
  getRaceMap,
  isGoToStableAction,
  isKickAction,
  isReleaseAction,
  isSkipAction,
  PlayerAction,
  PlayerColor,
} from "@rd/ludo-rules";
import { BET_CHOICES, ODDS_KEYS } from "../../src/constants.ts";
import { GenerateResultData } from "../../src/game-definition.ts";
import { generateDice } from "../../src/helpers/generate-dice.ts";
import { generateResult } from "../../src/helpers/index.ts";
import { ruleBotInstance } from "../../src/helpers/rule-bot-instance.ts";
import { IResult } from "../../src/models/interfaces/result.ts";

type Context = {
  sum: number;
  action: PlayerAction;
  playerColor: PlayerColor;
  raceMap: Record<number, PlayerColor>;
};

export const generateOdds = async (margin: number, currentResult: IResult) => {
  const oddCounts: Record<string, string> = ODDS_KEYS.reduce((acc, key) => {
    acc[key] = "";
    return acc;
  }, {} as Record<string, string>);
  const conditionMap: Record<string, (context: Context) => boolean> = {
    [BET_CHOICES.big]: isBig,
    [BET_CHOICES.small]: isSmall,
    [BET_CHOICES.odd]: isOdd,
    [BET_CHOICES.even]: isEven,
    [BET_CHOICES.move]: isMove,
    [BET_CHOICES.release]: isRelease,
    [BET_CHOICES.goStable]: isGoStable,
    [BET_CHOICES.kick]: isKick,
    [BET_CHOICES.noKick]: isNoKick,
    [BET_CHOICES.noMove]: isNoMove,
    [BET_CHOICES.noRelease]: isNoRelease,
    [BET_CHOICES.noStable]: isNoStable,
  };
  const raceMap = getRaceMap(currentResult.board);
  const diceChoices = [
    BET_CHOICES.big,
    BET_CHOICES.small,
    BET_CHOICES.odd,
    BET_CHOICES.even,
  ];
  const actionChoices = [
    BET_CHOICES.move,
    BET_CHOICES.release,
    BET_CHOICES.goStable,
    BET_CHOICES.kick,
    BET_CHOICES.noKick,
    BET_CHOICES.noMove,
    BET_CHOICES.noRelease,
    BET_CHOICES.noStable,
  ];
  for (let i = 1; i <= 6; i++) {
    for (let j = 1; j <= 6; j++) {
      const dices = [i, j];
      const sum = dices[0] + dices[1];
      const key = `${i}-${j}`;
      const diceState = new DiceState(dices);
      const playerColor =
        currentResult.currentPlayers[currentResult.nextTurnIndex];
      const possibleActions = getActions({
        raceMap,
        boardState: currentResult.board,
        playerColor,
        diceState,
      });
      const action = await ruleBotInstance.move({
        boardState: currentResult.board,
        raceMap,
        playerColor: currentResult.currentPlayers[currentResult.nextTurnIndex],
        diceState,
        possibleActions: possibleActions,
      });
      const context = {
        sum,
        action,
        playerColor,
        raceMap,
      };
      for (const [choice, condition] of Object.entries(conditionMap)) {
        if (condition(context)) {
          oddCounts[choice] = oddCounts[choice].concat(key);
        }
      }
    }
  }

  // check any odd count same value
  for (let i = 0; i < diceChoices.length; i++) {
    for (let j = 0; j < actionChoices.length; j++) {
      if (oddCounts[diceChoices[i]] === oddCounts[actionChoices[j]]) {
        return true;
      }
    }
  }
  return false;
};

const isBig = (context: Context) => context.sum > 6;
const isEven = (context: Context) => context.sum % 2 === 0;
const isOdd = (context: Context) => context.sum % 2 !== 0;
const isSmall = (context: Context) => context.sum <= 6;
const isMove = (context: Context) => !isSkipAction(context.action);
const isRelease = (context: Context) =>
  isReleaseAction(context.action, context.playerColor);
const isGoStable = (context: Context) => isGoToStableAction(context.action);
const isKick = (context: Context) =>
  isKickAction(context.action, context.raceMap);
const isNoKick = (context: Context) =>
  !isKickAction(context.action, context.raceMap);
const isNoMove = (context: Context) => isSkipAction(context.action);
const isNoRelease = (context: Context) =>
  !isReleaseAction(context.action, context.playerColor);
const isNoStable = (context: Context) => !isGoToStableAction(context.action);

async function runSimulation() {
  const initMatch: GenerateResultData = {
    currentBoardState: {
      [PlayerColor.RED]: [0, 0, 0, 0],
      [PlayerColor.GREEN]: [0, 0, 0, 0],
      [PlayerColor.YELLOW]: [0, 0, 0, 0],
      [PlayerColor.BLUE]: [0, 0, 0, 0],
    },
    currentTurnIndex: 0,
    currentPlayers: [
      PlayerColor.RED,
      PlayerColor.GREEN,
      PlayerColor.YELLOW,
      PlayerColor.BLUE,
    ],
    winners: [],
    dice: generateDice(),
  };
  let result = initMatch;
  let count = 0;
  for (let i = 0; i < 100000; i++) {
    const newResult = await generateResult(result);
    const odds = await generateOdds(0.1, newResult);
    if (odds) {
      count++;
    }
    result.currentBoardState = newResult.board;
    result.currentTurnIndex = newResult.nextTurnIndex;
    result.currentPlayers = newResult.currentPlayers;
    result.winners = newResult.winners;
    result.dice = generateDice();
  }
  console.log(`Hedge bet finding count: ${count}`);
  console.log(`Hedge bet finding percentage: ${count / 10000}`);
}
await runSimulation();
