import { PlayerColor } from "@rd/ludo-rules";

export const initNewBoard = () => {
  return {
    [PlayerColor.RED]: [0, 0, 0, 0],
    [PlayerColor.GREEN]: [0, 0, 0, 0],
    [PlayerColor.YELLOW]: [0, 0, 0, 0],
    [PlayerColor.BLUE]: [0, 0, 0, 0],
  };
};
