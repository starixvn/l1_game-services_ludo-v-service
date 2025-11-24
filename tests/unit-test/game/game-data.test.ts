import { PlayerColor } from "@rd/ludo-rules";
import GameData from "../../../src/game-data.js";
import { IResult } from "../../../src/models/interfaces/result.js";

describe("GameData", () => {
  describe("Constructor initialization", () => {
    test("should create instance with remaining time", () => {
      // Arrange
      const remainingTime = 30000;

      // Act
      const gameData = new GameData(remainingTime);

      // Assert
      expect(gameData).toBeInstanceOf(GameData);
      expect(gameData.remainingTime).toBe(remainingTime);
    });

    test("should initialize board with all players at starting position (0)", () => {
      // Arrange
      const remainingTime = 30000;

      // Act
      const gameData = new GameData(remainingTime);

      // Assert
      expect(gameData.result.board).toEqual({
        [PlayerColor.RED]: [0, 0, 0, 0],
        [PlayerColor.GREEN]: [0, 0, 0, 0],
        [PlayerColor.YELLOW]: [0, 0, 0, 0],
        [PlayerColor.BLUE]: [0, 0, 0, 0],
      });
    });

    test("should initialize nextTurnIndex to 0", () => {
      // Arrange
      const remainingTime = 30000;

      // Act
      const gameData = new GameData(remainingTime);

      // Assert
      expect(gameData.result.nextTurnIndex).toBe(0);
    });

    test("should initialize currentPlayers with all four colors", () => {
      // Arrange
      const remainingTime = 30000;

      // Act
      const gameData = new GameData(remainingTime);

      // Assert
      expect(gameData.result.currentPlayers).toEqual([
        PlayerColor.RED,
        PlayerColor.GREEN,
        PlayerColor.YELLOW,
        PlayerColor.BLUE,
      ]);
      expect(gameData.result.currentPlayers).toHaveLength(4);
    });

    test("should initialize winners as empty array", () => {
      // Arrange
      const remainingTime = 30000;

      // Act
      const gameData = new GameData(remainingTime);

      // Assert
      expect(gameData.result.winners).toEqual([]);
      expect(gameData.result.winners).toHaveLength(0);
    });

    test("should initialize dice as empty array", () => {
      // Arrange
      const remainingTime = 30000;

      // Act
      const gameData = new GameData(remainingTime);

      // Assert
      expect(gameData.result.dice).toEqual([]);
      expect(gameData.result.dice).toHaveLength(0);
    });

    test("should initialize action with default skip action", () => {
      // Arrange
      const remainingTime = 30000;

      // Act
      const gameData = new GameData(remainingTime);

      // Assert
      expect(gameData.result.action).toEqual({
        oldPosition: 0,
        newPosition: 0,
        playerColor: PlayerColor.RED,
      });
    });

    test("should initialize initRoundId to 0", () => {
      // Arrange
      const remainingTime = 30000;

      // Act
      const gameData = new GameData(remainingTime);

      // Assert
      expect(gameData.initRoundId).toBe(0);
    });

    test("should handle different remaining time values", () => {
      // Arrange
      const testCases = [0, 15000, 30000, 60000, 120000];

      // Act & Assert
      testCases.forEach((time) => {
        const gameData = new GameData(time);
        expect(gameData.remainingTime).toBe(time);
      });
    });
  });

  describe("Result structure", () => {
    test("should have all required result properties", () => {
      // Arrange
      const remainingTime = 30000;

      // Act
      const gameData = new GameData(remainingTime);

      // Assert
      expect(gameData.result).toHaveProperty("board");
      expect(gameData.result).toHaveProperty("nextTurnIndex");
      expect(gameData.result).toHaveProperty("currentPlayers");
      expect(gameData.result).toHaveProperty("winners");
      expect(gameData.result).toHaveProperty("dice");
      expect(gameData.result).toHaveProperty("action");
    });

    test("should allow updating result board state", () => {
      // Arrange
      const gameData = new GameData(30000);
      const newBoardState = {
        [PlayerColor.RED]: [5, 10, 15, 20],
        [PlayerColor.GREEN]: [3, 8, 13, 18],
        [PlayerColor.YELLOW]: [0, 0, 0, 0],
        [PlayerColor.BLUE]: [0, 0, 0, 0],
      };

      // Act
      gameData.result.board = newBoardState;

      // Assert
      expect(gameData.result.board).toEqual(newBoardState);
    });

    test("should allow updating nextTurnIndex", () => {
      // Arrange
      const gameData = new GameData(30000);
      const newTurnIndex = 2;

      // Act
      gameData.result.nextTurnIndex = newTurnIndex;

      // Assert
      expect(gameData.result.nextTurnIndex).toBe(newTurnIndex);
    });

    test("should allow updating winners array", () => {
      // Arrange
      const gameData = new GameData(30000);
      const winners = [PlayerColor.RED, PlayerColor.GREEN];

      // Act
      gameData.result.winners = winners;

      // Assert
      expect(gameData.result.winners).toEqual(winners);
    });

    test("should allow updating dice values", () => {
      // Arrange
      const gameData = new GameData(30000);
      const diceValues = [3, 5];

      // Act
      gameData.result.dice = diceValues;

      // Assert
      expect(gameData.result.dice).toEqual(diceValues);
    });

    test("should allow updating action", () => {
      // Arrange
      const gameData = new GameData(30000);
      const newAction = {
        type: "move",
        oldPosition: 5,
        newPosition: 12,
        playerColor: PlayerColor.BLUE,
      };

      // Act
      gameData.result.action = newAction as any;

      // Assert
      expect(gameData.result.action).toEqual(newAction);
    });
  });

  describe("Game configurations", () => {
    test("should allow setting gameConfigs", () => {
      // Arrange
      const gameData = new GameData(30000);
      const gameConfigs = {
        gameId: 1,
        enabled: true,
        odds: { margin: 0.05 },
        originalOdds: {
          big: 1.95,
          small: 2.35,
          odd: 1.95,
          even: 1.95,
        } as any,
        enableFreeBet: false,
        boostedChoices: true,
      };

      // Act
      gameData.gameConfigs = gameConfigs;

      // Assert
      expect(gameData.gameConfigs).toEqual(gameConfigs);
      expect(gameData.gameConfigs.gameId).toBe(1);
      expect(gameData.gameConfigs.enabled).toBe(true);
      expect(gameData.gameConfigs.odds.margin).toBe(0.05);
    });

    test("should allow updating initRoundId", () => {
      // Arrange
      const gameData = new GameData(30000);
      const initRoundId = 100;

      // Act
      gameData.initRoundId = initRoundId;

      // Assert
      expect(gameData.initRoundId).toBe(initRoundId);
    });

    test("should allow setting odds", () => {
      // Arrange
      const gameData = new GameData(30000);
      const odds = {
        big: 1.95,
        small: 2.35,
        odd: 1.95,
        even: 1.95,
        move: 1.5,
        noMove: 3.0,
        release: 5.0,
        noRelease: 1.2,
        goStable: 8.0,
        noStable: 1.1,
        kick: 4.0,
        noKick: 1.25,
      } as any;

      // Act
      gameData.odds = odds;

      // Assert
      expect(gameData.odds).toEqual(odds);
    });

    test("should allow setting exchange rates", () => {
      // Arrange
      const gameData = new GameData(30000);
      const exchangeRates = {
        exId: 1,
        code: {
          USD: 1.0,
          EUR: 0.85,
          GBP: 0.73,
        },
      };

      // Act
      gameData.exchangeRates = exchangeRates;

      // Assert
      expect(gameData.exchangeRates).toEqual(exchangeRates);
      expect(gameData.exchangeRates.code.USD).toBe(1.0);
    });

    test("should allow setting currency group games", () => {
      // Arrange
      const gameData = new GameData(30000);
      const currencyGroupGames = [
        { groupId: 1, name: "Group A" },
        { groupId: 2, name: "Group B" },
      ] as any;

      // Act
      gameData.currencyGroupGames = currencyGroupGames;

      // Assert
      expect(gameData.currencyGroupGames).toEqual(currencyGroupGames);
      expect(gameData.currencyGroupGames).toHaveLength(2);
    });
  });

  describe("In-game player data", () => {
    test("should allow setting ingame player data", () => {
      // Arrange
      const gameData = new GameData(30000);
      const ingameData = {
        player1: {
          ownBets: { big: 100, small: 50 },
          clientSeed: "seed123",
        },
        player2: {
          ownBets: { odd: 75, even: 25 },
          clientSeed: "seed456",
        },
      };

      // Act
      gameData.ingame = ingameData;

      // Assert
      expect(gameData.ingame).toEqual(ingameData);
      expect(gameData.ingame.player1.ownBets.big).toBe(100);
      expect(gameData.ingame.player2.clientSeed).toBe("seed456");
    });

    test("should allow adding player to ingame data", () => {
      // Arrange
      const gameData = new GameData(30000);
      gameData.ingame = {};
      const playerName = "newPlayer";
      const playerData = {
        ownBets: { move: 200 },
        clientSeed: "newseed",
      };

      // Act
      gameData.ingame[playerName] = playerData;

      // Assert
      expect(gameData.ingame[playerName]).toEqual(playerData);
    });

    test("should allow updating player bets in ingame data", () => {
      // Arrange
      const gameData = new GameData(30000);
      gameData.ingame = {
        player1: {
          ownBets: { big: 50 },
          clientSeed: "seed",
        },
      };

      // Act
      gameData.ingame.player1.ownBets.big = 150;
      gameData.ingame.player1.ownBets.small = 100;

      // Assert
      expect(gameData.ingame.player1.ownBets.big).toBe(150);
      expect(gameData.ingame.player1.ownBets.small).toBe(100);
    });
  });

  describe("Board state for all player colors", () => {
    test("should have board entry for RED player", () => {
      // Arrange & Act
      const gameData = new GameData(30000);

      // Assert
      expect(gameData.result.board[PlayerColor.RED]).toBeDefined();
      expect(gameData.result.board[PlayerColor.RED]).toEqual([0, 0, 0, 0]);
    });

    test("should have board entry for GREEN player", () => {
      // Arrange & Act
      const gameData = new GameData(30000);

      // Assert
      expect(gameData.result.board[PlayerColor.GREEN]).toBeDefined();
      expect(gameData.result.board[PlayerColor.GREEN]).toEqual([0, 0, 0, 0]);
    });

    test("should have board entry for YELLOW player", () => {
      // Arrange & Act
      const gameData = new GameData(30000);

      // Assert
      expect(gameData.result.board[PlayerColor.YELLOW]).toBeDefined();
      expect(gameData.result.board[PlayerColor.YELLOW]).toEqual([0, 0, 0, 0]);
    });

    test("should have board entry for BLUE player", () => {
      // Arrange & Act
      const gameData = new GameData(30000);

      // Assert
      expect(gameData.result.board[PlayerColor.BLUE]).toBeDefined();
      expect(gameData.result.board[PlayerColor.BLUE]).toEqual([0, 0, 0, 0]);
    });

    test("should have exactly 4 player colors in board", () => {
      // Arrange & Act
      const gameData = new GameData(30000);

      // Assert
      const boardKeys = Object.keys(gameData.result.board);
      expect(boardKeys).toHaveLength(4);
    });
  });

  describe("Integration scenarios", () => {
    test("should handle complete game state update", () => {
      // Arrange
      const gameData = new GameData(30000);
      const completeResult: IResult = {
        board: {
          [PlayerColor.RED]: [10, 20, 30, 40],
          [PlayerColor.GREEN]: [15, 25, 35, 45],
          [PlayerColor.YELLOW]: [5, 10, 15, 20],
          [PlayerColor.BLUE]: [8, 18, 28, 38],
        },
        nextTurnIndex: 2,
        currentPlayers: [
          PlayerColor.RED,
          PlayerColor.GREEN,
          PlayerColor.YELLOW,
          PlayerColor.BLUE,
        ],
        winners: [PlayerColor.RED],
        dice: [6, 5],
        action: {
          oldPosition: 30,
          newPosition: 41,
          playerColor: PlayerColor.RED,
        },
      };

      // Act
      gameData.result = completeResult;

      // Assert
      expect(gameData.result).toEqual(completeResult);
      expect(gameData.result.winners).toContain(PlayerColor.RED);
      expect(gameData.result.dice).toEqual([6, 5]);
    });

    test("should maintain separate instances", () => {
      // Arrange
      const gameData1 = new GameData(30000);
      const gameData2 = new GameData(45000);

      // Act
      gameData1.initRoundId = 100;
      gameData2.initRoundId = 200;
      gameData1.result.dice = [3, 4];
      gameData2.result.dice = [5, 6];

      // Assert
      expect(gameData1.initRoundId).toBe(100);
      expect(gameData2.initRoundId).toBe(200);
      expect(gameData1.result.dice).toEqual([3, 4]);
      expect(gameData2.result.dice).toEqual([5, 6]);
      expect(gameData1.remainingTime).toBe(30000);
      expect(gameData2.remainingTime).toBe(45000);
    });

    test("should support game progression simulation", () => {
      // Arrange
      const gameData = new GameData(30000);
      gameData.initRoundId = 1;

      // Act - Simulate multiple rounds
      gameData.roundId = 1;
      gameData.result.dice = [3, 4];
      gameData.result.action = {
        oldPosition: 0,
        newPosition: 7,
        playerColor: PlayerColor.RED,
      };
      gameData.result.nextTurnIndex = 1;

      // Round 2
      gameData.roundId = 2;
      gameData.result.dice = [5, 2];
      gameData.result.nextTurnIndex = 2;

      // Assert
      expect(gameData.roundId).toBe(2);
      expect(gameData.result.dice).toEqual([5, 2]);
      expect(gameData.result.nextTurnIndex).toBe(2);
    });
  });

  describe("Edge cases", () => {
    test("should handle zero remaining time", () => {
      // Arrange & Act
      const gameData = new GameData(0);

      // Assert
      expect(gameData.remainingTime).toBe(0);
      expect(gameData.result).toBeDefined();
    });

    test("should handle negative remaining time", () => {
      // Arrange & Act
      const gameData = new GameData(-1000);

      // Assert
      expect(gameData.remainingTime).toBe(-1000);
    });

    test("should handle very large remaining time", () => {
      // Arrange
      const largeTime = Number.MAX_SAFE_INTEGER;

      // Act
      const gameData = new GameData(largeTime);

      // Assert
      expect(gameData.remainingTime).toBe(largeTime);
    });

    test("should allow empty winners array to be set", () => {
      // Arrange
      const gameData = new GameData(30000);
      gameData.result.winners = [PlayerColor.RED, PlayerColor.BLUE];

      // Act
      gameData.result.winners = [];

      // Assert
      expect(gameData.result.winners).toEqual([]);
      expect(gameData.result.winners).toHaveLength(0);
    });

    test("should handle all players as winners", () => {
      // Arrange
      const gameData = new GameData(30000);

      // Act
      gameData.result.winners = [
        PlayerColor.RED,
        PlayerColor.GREEN,
        PlayerColor.YELLOW,
        PlayerColor.BLUE,
      ];

      // Assert
      expect(gameData.result.winners).toHaveLength(4);
      expect(gameData.result.winners).toContain(PlayerColor.RED);
      expect(gameData.result.winners).toContain(PlayerColor.GREEN);
      expect(gameData.result.winners).toContain(PlayerColor.YELLOW);
      expect(gameData.result.winners).toContain(PlayerColor.BLUE);
    });
  });
});
