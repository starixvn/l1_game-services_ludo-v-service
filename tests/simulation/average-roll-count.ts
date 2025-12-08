import { PlayerColor } from "@rd/ludo-rules";
import { GenerateResultData } from "../../src/game-definition.ts";
import { generateResult } from "../../src/helpers/generate-result.ts";
import { generateDice, initNewBoard } from "../../src/helpers/index.ts";
import { secureRandomRange } from "sc-core-rng";

const averageRollCount = async () => {
  const rollCount = [0];
  let matches = 0;
  let matchData: GenerateResultData = {
    currentBoardState: initNewBoard(),
    currentPlayers: [
      PlayerColor.RED,
      PlayerColor.GREEN,
      PlayerColor.YELLOW,
      PlayerColor.BLUE,
    ],
    currentTurnIndex: secureRandomRange(0, 3),
    dice: generateDice(),
    winners: [],
  };
  for (let i = 0; i < 100000; i++) {
    const result = await generateResult(matchData);
    matchData.currentBoardState = result.board;
    matchData.currentTurnIndex = result.nextTurnIndex;
    matchData.currentPlayers = result.currentPlayers;
    matchData.winners = result.winners;
    matchData.dice = generateDice();
    rollCount[matches]++;
    if (result.winners.length > 0) {
      matches++;
      rollCount[matches] = 0;
      matchData.winners = [];
      matchData.currentBoardState = initNewBoard();
      matchData.currentPlayers = [
        PlayerColor.RED,
        PlayerColor.GREEN,
        PlayerColor.YELLOW,
        PlayerColor.BLUE,
      ];
      matchData.currentTurnIndex = secureRandomRange(0, 3);
    }
  }
  console.log(
    `Average roll count: ${
      rollCount.reduce((a, b) => a + b, 0) / rollCount.length
    }`,
  );

  console.log(`Max roll count: ${Math.max(...rollCount)}`);
  console.log(`Min roll count: ${Math.min(...rollCount)}`);
};

averageRollCount();
