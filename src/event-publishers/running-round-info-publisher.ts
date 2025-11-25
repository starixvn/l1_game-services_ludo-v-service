import { Core } from "sc-game-base";
import GameData from "../game-data.js";
import { getPossibleActions } from "../helpers/index.js";

export class RunningRoundInfoPublisher extends Core.BaseEventPublishers
  .RunningRoundInfoPublisher {
  declare gameData: GameData;

  async publishInfoForNewRound() {
    const odds = this.gameData.odds;
    const possibleActions = await getPossibleActions(this.gameData);
    this.publishToAllUsers({
      nextState: {
        odds,
        currentTurnCount: this.gameData.roundId - this.gameData.initRoundId,
        nextAction: {
          nextPlayer:
            this.gameData.result.currentPlayers[
              this.gameData.result.nextTurnIndex
            ],
          possibleActions,
        },
      },
    });
  }
}
