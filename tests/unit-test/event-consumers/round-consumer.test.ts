import { PlayerColor } from "@rd/ludo-rules";
import mongoose from "mongoose";
import { RoundConsumer } from "../../../src/event-consumers/round-consumer.js";
import GameData from "../../../src/game-data.js";
import { IRound } from "../../../src/models/interfaces/round.js";

// Mock sc-game-base
jest.mock("sc-game-base", () => {
  return {
    Table: {
      TableGameData: class MockTableGameData {
        remainingTime: number;
        roundId: number;
        initRoundId: number;
        totalBets: any;
        chips: any;
        result: any;
        constructor(remainingTime: number) {
          this.remainingTime = remainingTime;
          this.roundId = 0;
          this.initRoundId = 0;
          this.totalBets = {};
          this.chips = [];
          this.result = {};
        }
      },
    },
  };
});

// Mock getOrDefault function
jest.mock("sc-game-base/dist/core/game-management-api/index.js", () => ({
  default: jest.fn(),
  getOrDefault: jest.fn(),
}));

describe("RoundConsumer", () => {
  describe("Class definition", () => {
    test("should be defined", () => {
      // Arrange & Act & Assert
      expect(RoundConsumer).toBeDefined();
    });

    test("should have required properties", () => {
      // Arrange
      const mockDeps = createMockDependencies();

      // Act
      const consumer = new RoundConsumer(mockDeps);

      // Assert
      expect(consumer.roundsRepository).toBeDefined();
      expect(consumer.gameData).toBeDefined();
      expect(consumer.definition).toBeDefined();
      expect(consumer.gameManagementApiClient).toBeDefined();
    });

    test("should have required methods", () => {
      // Arrange & Act
      const hasRequiredMethods =
        RoundConsumer.prototype.initNewRound !== undefined &&
        RoundConsumer.prototype.getLastArchiveRound !== undefined;

      // Assert
      expect(hasRequiredMethods).toBe(true);
      expect(RoundConsumer.prototype.initNewRound).toBeDefined();
      expect(RoundConsumer.prototype.getLastArchiveRound).toBeDefined();
    });
  });

  describe("Constructor", () => {
    test("should initialize with provided dependencies", () => {
      // Arrange
      const mockDeps = createMockDependencies();

      // Act
      const consumer = new RoundConsumer(mockDeps);

      // Assert
      expect(consumer.roundsRepository).toBe(mockDeps.roundsRepository);
      expect(consumer.gameData).toBe(mockDeps.gameData);
      expect(consumer.definition).toBe(mockDeps.definition);
      expect(consumer.gameManagementApiClient).toBeDefined();
    });
  });

  describe("Method signatures", () => {
    test("initNewRound should be an async function", () => {
      // Arrange
      const method = RoundConsumer.prototype.initNewRound;

      // Act
      const isAsync = method.constructor.name === "AsyncFunction";

      // Assert
      expect(method).toBeDefined();
      expect(isAsync).toBe(true);
    });

    test("getLastArchiveRound should be an async function", () => {
      // Arrange
      const method = RoundConsumer.prototype.getLastArchiveRound;

      // Act
      const isAsync = method.constructor.name === "AsyncFunction";

      // Assert
      expect(method).toBeDefined();
      expect(isAsync).toBe(true);
    });
  });

  describe("initNewRound", () => {
    describe("when lastRound exists", () => {
      test("should initialize roundId from lastRound.id + 1", async () => {
        // Arrange
        const mockDeps = createMockDependencies();
        const consumer = new RoundConsumer(mockDeps);
        const mockLastRound: Partial<IRound> = {
          id: 10,
          result: {
            board: {
              [PlayerColor.RED]: [5, 10, 0, 0],
              [PlayerColor.GREEN]: [0, 0, 0, 0],
              [PlayerColor.YELLOW]: [0, 0, 0, 0],
              [PlayerColor.BLUE]: [0, 0, 0, 0],
            },
            nextTurnIndex: 1,
            currentPlayers: [PlayerColor.RED, PlayerColor.GREEN],
            winners: [],
            dice: [3, 4],
            action: {
              oldPosition: 5,
              newPosition: 12,
              playerColor: PlayerColor.RED,
            },
          },
          initRoundId: 1,
        };
        (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLastRound),
          }),
        } as any);

        // Act
        await consumer.initNewRound();

        // Assert
        expect(consumer.gameData.roundId).toBe(11);
      });

      test("should copy result from lastRound", async () => {
        // Arrange
        const mockDeps = createMockDependencies();
        const consumer = new RoundConsumer(mockDeps);
        const mockLastRound: Partial<IRound> = {
          id: 5,
          result: {
            board: {
              [PlayerColor.RED]: [10, 15, 20, 0],
              [PlayerColor.GREEN]: [5, 0, 0, 0],
              [PlayerColor.YELLOW]: [0, 0, 0, 0],
              [PlayerColor.BLUE]: [0, 0, 0, 0],
            },
            nextTurnIndex: 2,
            currentPlayers: [
              PlayerColor.RED,
              PlayerColor.GREEN,
              PlayerColor.YELLOW,
            ],
            winners: [],
            dice: [6, 2],
            action: {
              oldPosition: 15,
              newPosition: 23,
              playerColor: PlayerColor.RED,
            },
          },
          initRoundId: 1,
        };
        (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLastRound),
          }),
        } as any);

        // Act
        await consumer.initNewRound();

        // Assert
        expect(consumer.gameData.result).toEqual(mockLastRound.result);
      });

      test("should set initRoundId to current roundId when there are winners", async () => {
        // Arrange
        const mockDeps = createMockDependencies();
        const consumer = new RoundConsumer(mockDeps);
        const mockLastRound: Partial<IRound> = {
          id: 20,
          result: {
            board: {
              [PlayerColor.RED]: [57, 57, 57, 57],
              [PlayerColor.GREEN]: [0, 0, 0, 0],
              [PlayerColor.YELLOW]: [0, 0, 0, 0],
              [PlayerColor.BLUE]: [0, 0, 0, 0],
            },
            nextTurnIndex: 0,
            currentPlayers: [PlayerColor.RED],
            winners: [PlayerColor.RED],
            dice: [6, 6],
            action: {
              oldPosition: 51,
              newPosition: 57,
              playerColor: PlayerColor.RED,
            },
          },
          initRoundId: 5,
        };
        (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLastRound),
          }),
        } as any);

        // Act
        await consumer.initNewRound();

        // Assert
        expect(consumer.gameData.initRoundId).toBe(21); // new roundId
      });

      test("should reset board to initial state when there are winners", async () => {
        // Arrange
        const mockDeps = createMockDependencies();
        const consumer = new RoundConsumer(mockDeps);
        const mockLastRound: Partial<IRound> = {
          id: 20,
          result: {
            board: {
              [PlayerColor.RED]: [57, 57, 57, 57],
              [PlayerColor.GREEN]: [10, 20, 0, 0],
              [PlayerColor.YELLOW]: [5, 0, 0, 0],
              [PlayerColor.BLUE]: [0, 0, 0, 0],
            },
            nextTurnIndex: 2,
            currentPlayers: [PlayerColor.RED],
            winners: [PlayerColor.RED],
            dice: [6, 6],
            action: {
              oldPosition: 51,
              newPosition: 57,
              playerColor: PlayerColor.RED,
            },
          },
          initRoundId: 5,
        };
        (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLastRound),
          }),
        } as any);

        // Act
        await consumer.initNewRound();

        // Assert
        expect(consumer.gameData.result.board).toEqual({
          [PlayerColor.RED]: [0, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        });
      });

      test("should reset currentPlayers to all four colors when there are winners", async () => {
        // Arrange
        const mockDeps = createMockDependencies();
        const consumer = new RoundConsumer(mockDeps);
        const mockLastRound: Partial<IRound> = {
          id: 20,
          result: {
            board: {
              [PlayerColor.RED]: [57, 57, 57, 57],
              [PlayerColor.GREEN]: [0, 0, 0, 0],
              [PlayerColor.YELLOW]: [0, 0, 0, 0],
              [PlayerColor.BLUE]: [0, 0, 0, 0],
            },
            nextTurnIndex: 0,
            currentPlayers: [PlayerColor.RED],
            winners: [PlayerColor.RED],
            dice: [6, 6],
            action: {
              oldPosition: 51,
              newPosition: 57,
              playerColor: PlayerColor.RED,
            },
          },
          initRoundId: 5,
        };
        (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLastRound),
          }),
        } as any);

        // Act
        await consumer.initNewRound();

        // Assert
        expect(consumer.gameData.result.currentPlayers).toEqual([
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ]);
      });

      test("should reset winners to empty array when there are winners", async () => {
        // Arrange
        const mockDeps = createMockDependencies();
        const consumer = new RoundConsumer(mockDeps);
        const mockLastRound: Partial<IRound> = {
          id: 20,
          result: {
            board: {
              [PlayerColor.RED]: [57, 57, 57, 57],
              [PlayerColor.GREEN]: [0, 0, 0, 0],
              [PlayerColor.YELLOW]: [0, 0, 0, 0],
              [PlayerColor.BLUE]: [0, 0, 0, 0],
            },
            nextTurnIndex: 0,
            currentPlayers: [PlayerColor.RED],
            winners: [PlayerColor.RED],
            dice: [6, 6],
            action: {
              oldPosition: 51,
              newPosition: 57,
              playerColor: PlayerColor.RED,
            },
          },
          initRoundId: 5,
        };
        (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLastRound),
          }),
        } as any);

        // Act
        await consumer.initNewRound();

        // Assert
        expect(consumer.gameData.result.winners).toEqual([]);
      });

      test("should reset dice to empty array when there are winners", async () => {
        // Arrange
        const mockDeps = createMockDependencies();
        const consumer = new RoundConsumer(mockDeps);
        const mockLastRound: Partial<IRound> = {
          id: 20,
          result: {
            board: {
              [PlayerColor.RED]: [57, 57, 57, 57],
              [PlayerColor.GREEN]: [0, 0, 0, 0],
              [PlayerColor.YELLOW]: [0, 0, 0, 0],
              [PlayerColor.BLUE]: [0, 0, 0, 0],
            },
            nextTurnIndex: 0,
            currentPlayers: [PlayerColor.RED],
            winners: [PlayerColor.RED],
            dice: [6, 6],
            action: {
              oldPosition: 51,
              newPosition: 57,
              playerColor: PlayerColor.RED,
            },
          },
          initRoundId: 5,
        };
        (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLastRound),
          }),
        } as any);

        // Act
        await consumer.initNewRound();

        // Assert
        expect(consumer.gameData.result.dice).toEqual([]);
      });

      test("should reset action when there are winners", async () => {
        // Arrange
        const mockDeps = createMockDependencies();
        const consumer = new RoundConsumer(mockDeps);
        const mockLastRound: Partial<IRound> = {
          id: 20,
          result: {
            board: {
              [PlayerColor.RED]: [57, 57, 57, 57],
              [PlayerColor.GREEN]: [0, 0, 0, 0],
              [PlayerColor.YELLOW]: [0, 0, 0, 0],
              [PlayerColor.BLUE]: [0, 0, 0, 0],
            },
            nextTurnIndex: 0,
            currentPlayers: [PlayerColor.RED],
            winners: [PlayerColor.RED],
            dice: [6, 6],
            action: {
              oldPosition: 51,
              newPosition: 57,
              playerColor: PlayerColor.RED,
            },
          },
          initRoundId: 5,
        };
        (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLastRound),
          }),
        } as any);

        // Act
        await consumer.initNewRound();

        // Assert
        expect(consumer.gameData.result.action).toEqual({
          oldPosition: 0,
          newPosition: 0,
          playerColor: PlayerColor.RED,
        });
      });

      test("should preserve nextTurnIndex from lastRound when there are winners", async () => {
        // Arrange
        const mockDeps = createMockDependencies();
        const consumer = new RoundConsumer(mockDeps);
        const mockLastRound: Partial<IRound> = {
          id: 20,
          result: {
            board: {
              [PlayerColor.RED]: [57, 57, 57, 57],
              [PlayerColor.GREEN]: [0, 0, 0, 0],
              [PlayerColor.YELLOW]: [0, 0, 0, 0],
              [PlayerColor.BLUE]: [0, 0, 0, 0],
            },
            nextTurnIndex: 3,
            currentPlayers: [PlayerColor.RED],
            winners: [PlayerColor.RED],
            dice: [6, 6],
            action: {
              oldPosition: 51,
              newPosition: 57,
              playerColor: PlayerColor.RED,
            },
          },
          initRoundId: 5,
        };
        (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLastRound),
          }),
        } as any);

        // Act
        await consumer.initNewRound();

        // Assert
        expect(consumer.gameData.result.nextTurnIndex).toBe(3);
      });

      test("should keep initRoundId from lastRound when there are no winners", async () => {
        // Arrange
        const mockDeps = createMockDependencies();
        const consumer = new RoundConsumer(mockDeps);
        const mockLastRound: Partial<IRound> = {
          id: 15,
          result: {
            board: {
              [PlayerColor.RED]: [10, 20, 0, 0],
              [PlayerColor.GREEN]: [5, 0, 0, 0],
              [PlayerColor.YELLOW]: [0, 0, 0, 0],
              [PlayerColor.BLUE]: [0, 0, 0, 0],
            },
            nextTurnIndex: 1,
            currentPlayers: [PlayerColor.RED, PlayerColor.GREEN],
            winners: [],
            dice: [4, 5],
            action: {
              oldPosition: 10,
              newPosition: 19,
              playerColor: PlayerColor.RED,
            },
          },
          initRoundId: 5,
        };
        (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLastRound),
          }),
        } as any);

        // Act
        await consumer.initNewRound();

        // Assert
        expect(consumer.gameData.initRoundId).toBe(5);
      });

      test("should query roundsRepository with correct parameters", async () => {
        // Arrange
        const mockDeps = createMockDependencies();
        const consumer = new RoundConsumer(mockDeps);
        const mockLastRound: Partial<IRound> = {
          id: 10,
          result: {
            board: {
              [PlayerColor.RED]: [0, 0, 0, 0],
              [PlayerColor.GREEN]: [0, 0, 0, 0],
              [PlayerColor.YELLOW]: [0, 0, 0, 0],
              [PlayerColor.BLUE]: [0, 0, 0, 0],
            },
            nextTurnIndex: 0,
            currentPlayers: [PlayerColor.RED],
            winners: [],
            dice: [],
            action: {
              oldPosition: 0,
              newPosition: 0,
              playerColor: PlayerColor.RED,
            },
          },
          initRoundId: 1,
        };
        (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLastRound),
          }),
        } as any);

        // Act
        await consumer.initNewRound();

        // Assert
        expect(mockDeps.roundsRepository.findOne).toHaveBeenCalledWith(
          {},
          { id: 1, result: 1, initRoundId: 1 },
          { sort: { id: -1 } },
        );
      });
    });

    describe("when lastRound does not exist", () => {
      test("should initialize roundId from archive", async () => {
        // Arrange
        const mockDeps = createMockDependencies();
        const consumer = new RoundConsumer(mockDeps);
        (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        } as any);
        const {
          getOrDefault,
        } = require("sc-game-base/dist/core/game-management-api/index.js");
        getOrDefault.mockResolvedValue({
          lastArcId: { _rounds: 100 },
        });

        // Act
        await consumer.initNewRound();

        // Assert
        expect(consumer.gameData.roundId).toBe(101);
      });

      test("should initialize board with all zeros", async () => {
        // Arrange
        const mockDeps = createMockDependencies();
        const consumer = new RoundConsumer(mockDeps);
        (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        } as any);
        const {
          getOrDefault,
        } = require("sc-game-base/dist/core/game-management-api/index.js");
        getOrDefault.mockResolvedValue({
          lastArcId: { _rounds: 50 },
        });

        // Act
        await consumer.initNewRound();

        // Assert
        expect(consumer.gameData.result.board).toEqual({
          [PlayerColor.RED]: [0, 0, 0, 0],
          [PlayerColor.GREEN]: [0, 0, 0, 0],
          [PlayerColor.YELLOW]: [0, 0, 0, 0],
          [PlayerColor.BLUE]: [0, 0, 0, 0],
        });
      });

      test("should initialize all players as current players", async () => {
        // Arrange
        const mockDeps = createMockDependencies();
        const consumer = new RoundConsumer(mockDeps);
        (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        } as any);
        const {
          getOrDefault,
        } = require("sc-game-base/dist/core/game-management-api/index.js");
        getOrDefault.mockResolvedValue({
          lastArcId: { _rounds: 50 },
        });

        // Act
        await consumer.initNewRound();

        // Assert
        expect(consumer.gameData.result.currentPlayers).toEqual([
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ]);
      });

      test("should set nextTurnIndex to 0", async () => {
        // Arrange
        const mockDeps = createMockDependencies();
        const consumer = new RoundConsumer(mockDeps);
        (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        } as any);
        const {
          getOrDefault,
        } = require("sc-game-base/dist/core/game-management-api/index.js");
        getOrDefault.mockResolvedValue({
          lastArcId: { _rounds: 50 },
        });

        // Act
        await consumer.initNewRound();

        // Assert
        expect(consumer.gameData.result.nextTurnIndex).toBe(0);
      });

      test("should set initRoundId equal to roundId", async () => {
        // Arrange
        const mockDeps = createMockDependencies();
        const consumer = new RoundConsumer(mockDeps);
        (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        } as any);
        const {
          getOrDefault,
        } = require("sc-game-base/dist/core/game-management-api/index.js");
        getOrDefault.mockResolvedValue({
          lastArcId: { _rounds: 75 },
        });

        // Act
        await consumer.initNewRound();

        // Assert
        expect(consumer.gameData.initRoundId).toBe(consumer.gameData.roundId);
        expect(consumer.gameData.initRoundId).toBe(76);
      });

      test("should call getLastArchiveRound", async () => {
        // Arrange
        const mockDeps = createMockDependencies();
        const consumer = new RoundConsumer(mockDeps);
        (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        } as any);
        const {
          getOrDefault,
        } = require("sc-game-base/dist/core/game-management-api/index.js");
        getOrDefault.mockResolvedValue({
          lastArcId: { _rounds: 50 },
        });
        const getLastArchiveRoundSpy = jest.spyOn(
          consumer,
          "getLastArchiveRound",
        );

        // Act
        await consumer.initNewRound();

        // Assert
        expect(getLastArchiveRoundSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("getLastArchiveRound", () => {
    test("should return archive round + 1 when _rounds exists", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundConsumer(mockDeps);
      const {
        getOrDefault,
      } = require("sc-game-base/dist/core/game-management-api/index.js");
      getOrDefault.mockResolvedValue({
        lastArcId: { _rounds: 100 },
      });

      // Act
      const result = await consumer.getLastArchiveRound();

      // Assert
      expect(result).toBe(101);
    });

    test("should return archive phien + 1 when _phiens exists but _rounds does not", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundConsumer(mockDeps);
      const {
        getOrDefault,
      } = require("sc-game-base/dist/core/game-management-api/index.js");
      getOrDefault.mockResolvedValue({
        lastArcId: { _phiens: 50 },
      });

      // Act
      const result = await consumer.getLastArchiveRound();

      // Assert
      expect(result).toBe(51);
    });

    test("should prefer _phiens over _rounds when both exist", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundConsumer(mockDeps);
      const {
        getOrDefault,
      } = require("sc-game-base/dist/core/game-management-api/index.js");
      getOrDefault.mockResolvedValue({
        lastArcId: { _phiens: 50, _rounds: 100 },
      });

      // Act
      const result = await consumer.getLastArchiveRound();

      // Assert
      expect(result).toBe(51);
    });

    test("should return 1 when archiveStatus is undefined", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundConsumer(mockDeps);
      const {
        getOrDefault,
      } = require("sc-game-base/dist/core/game-management-api/index.js");
      getOrDefault.mockResolvedValue(undefined);

      // Act
      const result = await consumer.getLastArchiveRound();

      // Assert
      expect(result).toBe(1);
    });

    test("should call getArchiveStatus with configName", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      mockDeps.definition.configName = "ludo-game-config";
      const consumer = new RoundConsumer(mockDeps);
      const {
        getOrDefault,
      } = require("sc-game-base/dist/core/game-management-api/index.js");
      const mockGetArchiveStatus = jest.fn().mockResolvedValue({
        lastArcId: { _rounds: 100 },
      });
      Object.defineProperty(consumer.gameManagementApiClient, "archiveStatus", {
        value: {
          getArchiveStatus: mockGetArchiveStatus,
        },
        writable: true,
        configurable: true,
      });
      getOrDefault.mockImplementation((promise) => promise);

      // Act
      await consumer.getLastArchiveRound();

      // Assert
      expect(mockGetArchiveStatus).toHaveBeenCalledWith("ludo-game-config");
    });

    test("should return NaN when lastArcId is empty object", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundConsumer(mockDeps);
      const {
        getOrDefault,
      } = require("sc-game-base/dist/core/game-management-api/index.js");
      getOrDefault.mockResolvedValue({
        lastArcId: {},
      });

      // Act
      const result = await consumer.getLastArchiveRound();

      // Assert
      expect(result).toBe(NaN);
    });
  });

  describe("Integration scenarios", () => {
    test("should handle complete initialization flow with existing rounds", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundConsumer(mockDeps);
      const mockLastRound: Partial<IRound> = {
        id: 25,
        result: {
          board: {
            [PlayerColor.RED]: [10, 20, 30, 0],
            [PlayerColor.GREEN]: [5, 10, 0, 0],
            [PlayerColor.YELLOW]: [0, 0, 0, 0],
            [PlayerColor.BLUE]: [15, 0, 0, 0],
          },
          nextTurnIndex: 2,
          currentPlayers: [
            PlayerColor.RED,
            PlayerColor.GREEN,
            PlayerColor.YELLOW,
            PlayerColor.BLUE,
          ],
          winners: [],
          dice: [5, 3],
          action: {
            oldPosition: 20,
            newPosition: 28,
            playerColor: PlayerColor.RED,
          },
        },
        initRoundId: 10,
      };
      (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockLastRound),
        }),
      } as any);

      // Act
      await consumer.initNewRound();

      // Assert
      expect(consumer.gameData.roundId).toBe(26);
      expect(consumer.gameData.initRoundId).toBe(10);
      expect(consumer.gameData.result).toEqual(mockLastRound.result);
    });

    test("should handle complete initialization flow without existing rounds", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundConsumer(mockDeps);
      (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      } as any);
      const {
        getOrDefault,
      } = require("sc-game-base/dist/core/game-management-api/index.js");
      getOrDefault.mockResolvedValue({
        lastArcId: { _rounds: 200 },
      });

      // Act
      await consumer.initNewRound();

      // Assert
      expect(consumer.gameData.roundId).toBe(201);
      expect(consumer.gameData.initRoundId).toBe(201);
      expect(consumer.gameData.result.board).toEqual({
        [PlayerColor.RED]: [0, 0, 0, 0],
        [PlayerColor.GREEN]: [0, 0, 0, 0],
        [PlayerColor.YELLOW]: [0, 0, 0, 0],
        [PlayerColor.BLUE]: [0, 0, 0, 0],
      });
      expect(consumer.gameData.result.currentPlayers.length).toBe(4);
      expect(consumer.gameData.result.nextTurnIndex).toBe(0);
    });
  });

  describe("Edge cases", () => {
    test("should handle when roundsRepository throws error", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundConsumer(mockDeps);
      (mockDeps.roundsRepository.findOne as jest.Mock).mockImplementation(
        () => {
          throw new Error("Database error");
        },
      );

      // Act & Assert
      await expect(consumer.initNewRound()).rejects.toThrow("Database error");
    });

    test("should handle roundId of 0 and increment to 1", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundConsumer(mockDeps);
      const mockLastRound: Partial<IRound> = {
        id: 0,
        result: {
          board: {
            [PlayerColor.RED]: [0, 0, 0, 0],
            [PlayerColor.GREEN]: [0, 0, 0, 0],
            [PlayerColor.YELLOW]: [0, 0, 0, 0],
            [PlayerColor.BLUE]: [0, 0, 0, 0],
          },
          nextTurnIndex: 0,
          currentPlayers: [PlayerColor.RED],
          winners: [],
          dice: [],
          action: {
            oldPosition: 0,
            newPosition: 0,
            playerColor: PlayerColor.RED,
          },
        },
        initRoundId: 0,
      };
      (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockLastRound),
        }),
      } as any);

      // Act
      await consumer.initNewRound();

      // Assert
      expect(consumer.gameData.roundId).toBe(1);
    });

    test("should handle very large roundId values", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundConsumer(mockDeps);
      const mockLastRound: Partial<IRound> = {
        id: 999999,
        result: {
          board: {
            [PlayerColor.RED]: [0, 0, 0, 0],
            [PlayerColor.GREEN]: [0, 0, 0, 0],
            [PlayerColor.YELLOW]: [0, 0, 0, 0],
            [PlayerColor.BLUE]: [0, 0, 0, 0],
          },
          nextTurnIndex: 0,
          currentPlayers: [PlayerColor.RED],
          winners: [],
          dice: [],
          action: {
            oldPosition: 0,
            newPosition: 0,
            playerColor: PlayerColor.RED,
          },
        },
        initRoundId: 999999,
      };
      (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockLastRound),
        }),
      } as any);

      // Act
      await consumer.initNewRound();

      // Assert
      expect(consumer.gameData.roundId).toBe(1000000);
    });

    test("should handle multiple winners in result", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundConsumer(mockDeps);
      const mockLastRound: Partial<IRound> = {
        id: 50,
        result: {
          board: {
            [PlayerColor.RED]: [57, 57, 57, 57],
            [PlayerColor.GREEN]: [57, 57, 57, 57],
            [PlayerColor.YELLOW]: [0, 0, 0, 0],
            [PlayerColor.BLUE]: [0, 0, 0, 0],
          },
          nextTurnIndex: 0,
          currentPlayers: [PlayerColor.RED, PlayerColor.GREEN],
          winners: [PlayerColor.RED, PlayerColor.GREEN],
          dice: [6, 6],
          action: {
            oldPosition: 51,
            newPosition: 57,
            playerColor: PlayerColor.GREEN,
          },
        },
        initRoundId: 30,
      };
      (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockLastRound),
        }),
      } as any);

      // Act
      await consumer.initNewRound();

      // Assert
      expect(consumer.gameData.roundId).toBe(51);
      expect(consumer.gameData.initRoundId).toBe(51); // Should reset since winners exist
    });

    test("should handle empty winners array", async () => {
      // Arrange
      const mockDeps = createMockDependencies();
      const consumer = new RoundConsumer(mockDeps);
      const mockLastRound: Partial<IRound> = {
        id: 10,
        result: {
          board: {
            [PlayerColor.RED]: [10, 0, 0, 0],
            [PlayerColor.GREEN]: [0, 0, 0, 0],
            [PlayerColor.YELLOW]: [0, 0, 0, 0],
            [PlayerColor.BLUE]: [0, 0, 0, 0],
          },
          nextTurnIndex: 0,
          currentPlayers: [PlayerColor.RED],
          winners: [],
          dice: [3, 4],
          action: {
            oldPosition: 0,
            newPosition: 7,
            playerColor: PlayerColor.RED,
          },
        },
        initRoundId: 5,
      };
      (mockDeps.roundsRepository.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockLastRound),
        }),
      } as any);

      // Act
      await consumer.initNewRound();

      // Assert
      expect(consumer.gameData.initRoundId).toBe(5); // Should not change
    });
  });
});

// Helper function to create mock dependencies
function createMockDependencies() {
  const mockGameData = new GameData(30000);
  mockGameData.roundId = 0;
  mockGameData.initRoundId = 0;
  mockGameData.result = {
    board: {
      [PlayerColor.RED]: [0, 0, 0, 0],
      [PlayerColor.GREEN]: [0, 0, 0, 0],
      [PlayerColor.YELLOW]: [0, 0, 0, 0],
      [PlayerColor.BLUE]: [0, 0, 0, 0],
    },
    nextTurnIndex: 0,
    currentPlayers: [],
    winners: [],
    dice: [],
    action: {
      oldPosition: 0,
      newPosition: 0,
      playerColor: PlayerColor.RED,
    },
  };

  const mockDefinition = {
    configName: "test-config",
  } as any;

  const mockRoundsRepository = {
    findOne: jest.fn(),
  } as any;

  const mockGameManagementApiClientFactory = {
    instance: jest.fn().mockReturnValue({
      archiveStatus: {
        getArchiveStatus: jest.fn(),
      },
    }),
  } as any;

  return {
    gameData: mockGameData,
    definition: mockDefinition,
    roundsRepository: mockRoundsRepository as mongoose.Model<IRound>,
    gameManagementApiClientFactory: mockGameManagementApiClientFactory,
  };
}
