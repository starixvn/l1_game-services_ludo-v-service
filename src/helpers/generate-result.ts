import {
  DiceState,
  initSameValue,
  PlayerColor,
  PlayerMoveInput,
  updateGameState,
} from "@rd/ludo-rules";
import { secureRandomRange } from "sc-core-rng";
import { GenerateResultData } from "../game-definition.js";
import { ruleBotInstance } from "./rule-bot-instance.js";

export const generateResult = async (data: GenerateResultData) => {
  if (data.winners.length >= 4) {
    data.currentBoardState = initSameValue([0, 0, 0, 0]);
    data.currentTurnIndex = secureRandomRange(0, 3);
    data.currentPlayers = [
      PlayerColor.RED,
      PlayerColor.GREEN,
      PlayerColor.YELLOW,
      PlayerColor.BLUE,
    ];
  }
  const dice = [secureRandomRange(1, 6), secureRandomRange(1, 6)];
  const diceState = new DiceState(dice);
  const { gameState, nextTurn } = await updateGameState(
    data.currentBoardState,
    data.currentPlayers,
    data.currentTurnIndex,
    diceState,
    (input: PlayerMoveInput) => ruleBotInstance.move(input),
  );

  return {
    boardState: gameState.board,
    dice,
    action: gameState.playerAction,
    kickedPlayer: gameState.kickedPlayer,
    nextTurnIndex: nextTurn,
    winners: gameState.winner,
  };
};
