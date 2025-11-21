import { Table } from "sc-game-base";
import GameData from "../game-data.js";

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
}
