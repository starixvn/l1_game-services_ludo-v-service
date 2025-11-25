import { getAllActionByBot, PlayerColor } from "@rd/ludo-rules";
import GameData from "../game-data";
import { ruleBotInstance } from "./rule-bot-instance.js";

export const getPossibleActions = async (gameData: GameData) => {
  const nextPlayerColor =
    gameData.result.currentPlayers[gameData.result.nextTurnIndex];
  const possibleActionSet = await getAllActionByBot(
    ruleBotInstance,
    gameData.result.board,
    nextPlayerColor,
  );

  return Object.keys(possibleActionSet).map((key) => {
    const [oldPosition, newPosition] = key.split("-");
    return {
      oldPosition: getWorldPosition(parseInt(oldPosition), nextPlayerColor),
      newPosition: getWorldPosition(parseInt(newPosition), nextPlayerColor),
    };
  });
};

const getWorldPosition = (position: number, playerColor: PlayerColor) => {
  return position >= 57 ? playerColor * 100 + position : position;
};
