import { helpers } from "sc-common";
import { Core } from "sc-game-base";
import GameData from "../game-data.js";

export class PlaceBetConsumer extends Core.BaseEventConsumers.PlaceBetConsumer {
  declare gameData: GameData;

  composeBetChoiceValidationCriteria(betChoice: string) {
    return [
      {
        failure: !this.definition.choices.includes(betChoice),
        notice: this.getNoticeObj(helpers.noticeHelper.invalidBet, undefined),
      },
      {
        failure:
          this.gameData.odds[betChoice as keyof typeof this.gameData.odds] ===
          0,
        notice: this.getNoticeObj(helpers.noticeHelper.invalidBet, undefined),
      },
    ];
  }
}
