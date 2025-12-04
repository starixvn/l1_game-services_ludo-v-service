import { PlayerColor } from "@rd/ludo-rules";
import { initNewBoard } from "../../../src/helpers/init-new-board.js";

describe("initNewBoard", () => {
  test("should be defined", () => {
    // Arrange & Act & Assert
    expect(initNewBoard).toBeDefined();
  });

  test("should return a board with all four player colors", () => {
    // Act
    const board = initNewBoard();

    // Assert
    expect(board[PlayerColor.RED]).toBeDefined();
    expect(board[PlayerColor.GREEN]).toBeDefined();
    expect(board[PlayerColor.YELLOW]).toBeDefined();
    expect(board[PlayerColor.BLUE]).toBeDefined();
  });

  test("should initialize all positions to zero for RED", () => {
    // Act
    const board = initNewBoard();

    // Assert
    expect(board[PlayerColor.RED]).toEqual([0, 0, 0, 0]);
  });

  test("should initialize all positions to zero for GREEN", () => {
    // Act
    const board = initNewBoard();

    // Assert
    expect(board[PlayerColor.GREEN]).toEqual([0, 0, 0, 0]);
  });

  test("should initialize all positions to zero for YELLOW", () => {
    // Act
    const board = initNewBoard();

    // Assert
    expect(board[PlayerColor.YELLOW]).toEqual([0, 0, 0, 0]);
  });

  test("should initialize all positions to zero for BLUE", () => {
    // Act
    const board = initNewBoard();

    // Assert
    expect(board[PlayerColor.BLUE]).toEqual([0, 0, 0, 0]);
  });

  test("should return a new object each time", () => {
    // Act
    const board1 = initNewBoard();
    const board2 = initNewBoard();

    // Assert
    expect(board1).not.toBe(board2);
    expect(board1[PlayerColor.RED]).not.toBe(board2[PlayerColor.RED]);
  });

  test("should return correct board structure", () => {
    // Act
    const board = initNewBoard();

    // Assert
    expect(board).toEqual({
      [PlayerColor.RED]: [0, 0, 0, 0],
      [PlayerColor.GREEN]: [0, 0, 0, 0],
      [PlayerColor.YELLOW]: [0, 0, 0, 0],
      [PlayerColor.BLUE]: [0, 0, 0, 0],
    });
  });

  test("should have four pieces per player", () => {
    // Act
    const board = initNewBoard();

    // Assert
    expect(board[PlayerColor.RED].length).toBe(4);
    expect(board[PlayerColor.GREEN].length).toBe(4);
    expect(board[PlayerColor.YELLOW].length).toBe(4);
    expect(board[PlayerColor.BLUE].length).toBe(4);
  });
});
