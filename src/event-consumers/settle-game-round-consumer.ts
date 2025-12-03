import { convertBoardState } from "@rd/ludo-rules";
import { Table } from "sc-game-base";
import GameData from "../game-data.js";
import { IBet } from "../models/interfaces/bet.js";
import { IResult } from "../models/interfaces/result.js";
import { ISettlementResult } from "../models/interfaces/settlement-result.js";

export class SettleGameRoundConsumer extends Table.EventConsumers
  .TableSettleGameRoundConsumer {
  declare gameData: GameData;

  async settleRound() {
    const result = this.generateResult();
    const settlementResult = this.definition.settle(result);
    const { roundId, exchangeRates } = this.gameData;

    const newRound = await this.roundsRepository.create({
      id: roundId,
      result,
      settlementResult,
      initRoundId: this.gameData.initRoundId,
      time: new Date(),
      exchangeRateId: exchangeRates.exId,
      margins: this.gameData.gameConfigs.odds,
    });

    if (newRound) {
      this.roundResultPublisher.publishRoundResult(
        this.collectRoundResult(result, settlementResult, roundId),
      );

      const finish = {
        settlementResult,
        result,
        roundId: newRound.id,
        time: newRound.time,
      };

      this.gameData.roundId = finish.roundId + 1;

      const isNewGame = result.winners.length > 0;
      if (isNewGame) {
        this.gameData.initRoundId = this.gameData.roundId;
      }

      await this.settleBets(finish);

      this.roundResultPublisher.publishWinners(
        roundId,
        this.gameData.winningPlayers,
      );
    }
  }

  collectRoundResult(
    result: IResult,
    settlementResult: ISettlementResult,
    roundId: number,
  ) {
    // Filter out settlement result entries where odds are 0
    const filteredSettlementResult = Object.entries(settlementResult).reduce(
      (acc, [key, value]) => {
        const oddsValue =
          this.gameData.odds[key as keyof typeof this.gameData.odds];
        if (oddsValue !== 0) {
          acc[key as keyof ISettlementResult] = value;
        }
        return acc;
      },
      {} as Partial<ISettlementResult>,
    );

    return {
      result: {
        board: convertBoardState(result.board),
        dice1: result.dice[0],
        dice2: result.dice[1],
        winner: result.winners.length > 0 ? result.winners[0] : undefined,
        action: {
          ...result.action,
          player: result.action.playerColor,
          playerColor: undefined,
        },
      },
      settlementResult: filteredSettlementResult,
      roundId,
    };
  }

  calculateBetResult(
    settlementResult: ISettlementResult,
    bet: IBet,
    odds: Record<string, number>,
  ) {
    const betResult = Object.entries(settlementResult).reduce(
      (result, [choice, win]) => {
        const betAmount = bet[choice as keyof IBet] ?? 0;
        if (betAmount === 0) {
          return result;
        }
        const originalOdds = odds[choice] || 1;
        const effectiveOdds = bet.freeBet ? originalOdds - 1 : originalOdds;
        const winAmount = win ? betAmount * effectiveOdds : 0;

        result.totalBetAmount += betAmount;
        result.totalWin += winAmount;
        result.winningByChoices[choice] = winAmount;

        if (winAmount > 0) {
          result.netWin += winAmount - betAmount;
        } else {
          result.totalLost += betAmount;
        }

        return result;
      },
      {
        totalBetAmount: 0,
        totalWin: 0,
        netWin: 0,
        totalLost: 0,
        winningByChoices: {} as Record<string, number>,
      },
    );

    betResult.totalWin = parseFloat(betResult.totalWin.toFixed(2));
    betResult.netWin = parseFloat(betResult.netWin.toFixed(2));

    return betResult;
  }
}
