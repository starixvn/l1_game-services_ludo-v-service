import { DiceState, PlayerMoveInput, updateGameState } from "@rd/ludo-rules";
import { secureRandomRange } from "sc-core-rng";
import { GenerateResultData } from "../game-definition.js";
import { ruleBotInstance } from "./rule-bot-instance.js";

export const generateResult = async (data: GenerateResultData) => {
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
  };
};
