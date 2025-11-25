import { Core } from "sc-game-base";
import GameData from "../game-data.js";
import { getPossibleActions } from "../helpers/index.js";

export class GameStatusPublisher extends Core.BaseEventPublishers
  .GameStatusPublisher {
  declare gameData: GameData;

  async publishInfoForNewRound() {
    const odds = this.gameData.odds;
    const possibleActions = await getPossibleActions(this.gameData);
    this.publishToAllUsers({
      odds,
      possibleActions,
    });
  }
}
