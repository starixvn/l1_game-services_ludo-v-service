import { Core } from "sc-game-base";
import GameData from "../game-data.js";
import { getPossibleActions } from "../helpers/index.js";

export class RunningRoundInfoPublisher extends Core.BaseEventPublishers
  .RunningRoundInfoPublisher {
  declare gameData: GameData;

  publishToAllInGameUsers(payload: any) {
    const players = Object.values(this.gameData.realPlayers).filter(
      (realPlayer) => realPlayer.sendedInGame,
    );

    players.forEach((realPlayer) => {
      this.gameData.realPlayers[realPlayer.socketClient.id].socketClient.emit(
        this.gameName,
        payload,
      );
    });
  }

  async publishInfoForNewRound() {
    const odds = this.gameData.odds;
    const possibleActions = await getPossibleActions(this.gameData);
    this.publishToAllInGameUsers({
      nextState: {
        currentTurnCount: this.gameData.roundId - this.gameData.initRoundId,
        nextAction: {
          nextPlayer:
            this.gameData.result.currentPlayers[
              this.gameData.result.nextTurnIndex
            ],
          possibleActions,
        },
      },
      odds,
    });
  }
}
