import {
  DiceState,
  PlayerColor,
  PlayerMoveInput,
  updateGameState,
} from "@rd/ludo-rules";
import { secureRandomRange } from "sc-core-rng";
import { GenerateResultData } from "../game-definition.js";
import { IResult } from "../models/interfaces/result.js";
import { ruleBotInstance } from "./rule-bot-instance.js";

export const generateResult = async (
  data: GenerateResultData,
): Promise<IResult> => {
  if (data.winners.length > 0) {
    data.currentBoardState = {
      [PlayerColor.RED]: [0, 0, 0, 0],
      [PlayerColor.GREEN]: [0, 0, 0, 0],
      [PlayerColor.YELLOW]: [0, 0, 0, 0],
      [PlayerColor.BLUE]: [0, 0, 0, 0],
    };
    data.currentTurnIndex = secureRandomRange(0, 3);
    data.currentPlayers = [
      PlayerColor.RED,
      PlayerColor.GREEN,
      PlayerColor.YELLOW,
      PlayerColor.BLUE,
    ];
    data.winners = [];
  }
  const { dice } = data;
  const diceState = new DiceState(dice);
  const { gameState, nextTurn } = await updateGameState(
    data.currentBoardState,
    data.currentPlayers,
    data.currentTurnIndex,
    diceState,
    (input: PlayerMoveInput) => ruleBotInstance.move(input),
  );
  data.winners = [...data.winners, ...(gameState.winners ?? [])];

  return {
    board: gameState.board,
    nextTurnIndex: nextTurn,
    currentPlayers: [...data.currentPlayers],
    winners: data.winners,
    action: {
      ...gameState.playerAction,
      playerColor: gameState.currentPlayer,
    },
    dice,
    kickedPlayer: gameState.kickedPlayer?.player,
  };
};
