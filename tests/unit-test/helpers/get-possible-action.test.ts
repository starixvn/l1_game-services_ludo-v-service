import { getAllActionByBot, PlayerColor } from "@rd/ludo-rules";
import GameData from "../../../src/game-data.ts";
import { getPossibleActions } from "../../../src/helpers/index.ts";

jest.mock("@rd/ludo-rules", () => ({
  getAllActionByBot: jest.fn(),
  PlayerColor: {
    RED: 0,
    GREEN: 1,
    YELLOW: 2,
    BLUE: 3,
  },
}));

jest.mock("../../../src/helpers/rule-bot-instance.ts", () => ({
  ruleBotInstance: {
    move: jest.fn(),
  },
}));

import { ruleBotInstance } from "../../../src/helpers/rule-bot-instance.ts";

describe("getPossibleAction", () => {
  test("should call getAllActionByBot with correct arguments", async () => {
    // Arrange
    const gameData = new GameData(32);

    jest.mocked(getAllActionByBot).mockResolvedValue({
      "0-1": 5,
      "5-10": 6,
    });

    // Act
    await getPossibleActions(gameData);

    // Assert
    expect(getAllActionByBot).toHaveBeenCalledWith(
      ruleBotInstance,
      gameData.result.board,
      PlayerColor.RED,
    );
  });

  test("should return correct possible actions for next player", async () => {
    // Arrange
    const gameData = new GameData(32);
    gameData.result.nextTurnIndex = 1;
    gameData.result.currentPlayers = [PlayerColor.RED, PlayerColor.GREEN];

    jest.mocked(getAllActionByBot).mockResolvedValue({
      "56-57": 1,
      "23-28": 2,
    });

    // Act
    const possibleActions = await getPossibleActions(gameData);

    // Assert
    expect(possibleActions).toEqual([
      { oldPosition: 56, newPosition: 157 },
      { oldPosition: 23, newPosition: 28 },
    ]);
  });
});
