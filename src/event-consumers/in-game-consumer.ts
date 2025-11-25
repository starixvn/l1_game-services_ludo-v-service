import { convertBoardState } from "@rd/ludo-rules";
import { Table } from "sc-game-base";
import { Systems } from "sc-game-base/dist/constants/systems.js";
import GameData from "../game-data.js";
import GameDefinition from "../game-definition.js";
import { getPossibleActions } from "../helpers/index.js";
import { RoundQuery } from "../query-apis/round-query.js";
import { RealPlayer } from "../types.js";

declare module "sc-game-base" {
  namespace Table.EventConsumers {
    interface TableInGameConsumer {
      getUserInfo(realPlayer: any): Promise<any>;
    }
  }
}

export class InGameConsumer extends Table.EventConsumers.TableInGameConsumer {
  declare gameData: GameData;
  declare roundQuery: RoundQuery;
  declare definition: GameDefinition;

  async buildPayload(realPlayer: RealPlayer) {
    const user = await this.getUserInfo(realPlayer);

    const { margin } = this.gameData.gameConfigs.odds;
    const { totalBets, roundId, exchangeRates } = this.gameData;
    const { session } = realPlayer;
    const rate = exchangeRates.code[session.currencyCode] * session.multiplier;
    const settings = this.gameData.currencyGroupGames.find(
      (x) => x.groupId.toString() === session.currencyGroupId,
    );
    const gameConfigs = {
      ...settings,
      margin,
      odds: this.gameData.odds,
    };
    const { ownBets } = this.gameData.ingame[realPlayer.profile.name] || {
      ownBets: {},
    };

    const roundHistory = await this.roundQuery.getList(
      this.definition.numberOfRoundHistory,
      {
        id: 1,
        result: {
          dice1: { $arrayElemAt: ["$result.dice", 0] },
          dice2: { $arrayElemAt: ["$result.dice", 1] },
        },
      },
    );

    const payload = {
      roundId,
      gameConfigs,
      roundHistory,
      ownBets,
      gameState: await this.generateGameState(),
      totalBets,
      user: { ...user, rate },
    } as any;

    if (realPlayer.promotion && !realPlayer.promotionTOProgress) {
      payload.promotion = realPlayer.promotion;
    }

    if (realPlayer.promotionTOProgress) {
      payload.promotionTOProgress = {
        totalTO: realPlayer.promotionTOProgress.totalTurnover,
        minTO: realPlayer.promotionTOProgress.minRequiredTurnover,
        remainTO: realPlayer.promotionTOProgress.remainingTO,
        progress: realPlayer.promotionTOProgress.progressPercentage,
        canClaim: realPlayer.promotionTOProgress.canClaim,
        win: realPlayer.promotionTOProgress.totalWinAmount,
        expire: realPlayer.promotionTOProgress.claimExpirationDate,
        promotionId: realPlayer.promotion.promotionId,
      };
    }

    const {
      remainingTime,
      chips,
      gameConfigs: gameConfigsData,
    } = this.gameData;
    const disabled = !gameConfigsData || !gameConfigsData.enabled;
    const players =
      realPlayer.session?.system === Systems.Mobi
        ? {}
        : this.buildPlayersPayload(realPlayer);

    return disabled && realPlayer.session?.system === Systems.Mini
      ? { ...payload, players, chips }
      : { ...payload, remainingTime, players, chips };
  }

  async generateGameState() {
    const nextPlayer =
      this.gameData.result.currentPlayers[this.gameData.result.nextTurnIndex];
    const possibleActions = await getPossibleActions(this.gameData);
    return {
      board: convertBoardState(this.gameData.result.board),
      currentTurnCount: this.gameData.roundId - this.gameData.initRoundId,
      nextPlayer,
      possibleActions,
    };
  }
}
