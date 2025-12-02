import { GameData } from "sc-game-base/dist/core/index";
import { RunningRoundInfoPublisher } from "../../../src/event-publishers/index.ts";
import { PlayerColor } from "@rd/ludo-rules";
import { run } from "../../integration-test/game-service-setup/game-service-app";

jest.mock("sc-game-base", () => {
  const mockBaseClass = class MockRunningRoundInfoPublisher {
    constructor() {}
    publishToAllInGameUsers = jest.fn();
    publishInfoForNewRound = jest.fn();
  };

  return {
    Core: {
      BaseEventPublishers: {
        RunningRoundInfoPublisher: mockBaseClass,
      },
    },
  };
});

describe("RunningRoundInfoPublisher", () => {
  describe("publishToAllInGameUsers", () => {
    let runningRoundInfoPublisher: RunningRoundInfoPublisher;
    beforeEach(async () => {
      // Arrange
      runningRoundInfoPublisher = Object.create(
        RunningRoundInfoPublisher.prototype,
      );
      const { Core } = await import("sc-game-base");
      const mockBaseInstance = new (Core.BaseEventPublishers
        .RunningRoundInfoPublisher as any)();
      Object.setPrototypeOf(
        Object.getPrototypeOf(runningRoundInfoPublisher),
        mockBaseInstance,
      );
      Object.assign(runningRoundInfoPublisher, {
        gameData: new GameData(32),
        gameName: "ludo",
      });
    });

    test("should publish running round info", async () => {
      // Arrange
      runningRoundInfoPublisher.gameData.result = {
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        nextTurnIndex: 0,
        board: {
          [PlayerColor.RED]: [0, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        winners: [],
        action: {
          oldPosition: 0,
          newPosition: 0,
          playerColor: PlayerColor.RED,
        },
        dice: [1, 2],
      };
      const mockEmit = jest.fn();
      runningRoundInfoPublisher.gameData.realPlayers = {
        "1": {
          id: "1",
          socketClient: {
            id: "1",
            emit: mockEmit,
          },
          sendedInGame: true,
        } as any,
      };
      const mockPayload = {
        nextState: {
          currentTurnCount: 0,
          nextAction: {
            nextPlayer: PlayerColor.RED,
            possibleActions: [],
          },
        },
      };
      // Act
      runningRoundInfoPublisher.publishToAllInGameUsers(mockPayload);

      // Assert
      expect(mockEmit).toHaveBeenCalledWith("ludo", mockPayload);
      expect(mockEmit).toHaveBeenCalledTimes(1);
    });
  });

  describe("publishInfoForNewRound", () => {
    let runningRoundInfoPublisher: RunningRoundInfoPublisher;
    beforeEach(async () => {
      // Arrange
      runningRoundInfoPublisher = Object.create(
        RunningRoundInfoPublisher.prototype,
      );
      const { Core } = await import("sc-game-base");
      const mockBaseInstance = new (Core.BaseEventPublishers
        .RunningRoundInfoPublisher as any)();
      Object.setPrototypeOf(
        Object.getPrototypeOf(runningRoundInfoPublisher),
        mockBaseInstance,
      );
      Object.assign(runningRoundInfoPublisher, {
        gameData: new GameData(32),
      });
    });
    test("should publish running round info", async () => {
      // Arrange
      runningRoundInfoPublisher.gameData.result = {
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        nextTurnIndex: 0,
        board: {
          [PlayerColor.RED]: [0, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        },
        winners: [],
        action: {
          oldPosition: 0,
          newPosition: 0,
          playerColor: PlayerColor.RED,
        },
        dice: [1, 2],
      };
      jest.spyOn(runningRoundInfoPublisher, "publishToAllInGameUsers");

      // Act
      await runningRoundInfoPublisher.publishInfoForNewRound();

      // Assert
      expect(
        runningRoundInfoPublisher.publishToAllInGameUsers,
      ).toHaveBeenCalled();
    });
  });
});
