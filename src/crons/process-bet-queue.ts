import mongoose from "mongoose";
import { Table } from "sc-game-base";
import GameData from "../game-data.js";
import { IBet } from "../models/interfaces/bet.js";

export class ProcessBetQueue extends Table.Crons.TableProcessBetQueue {
  declare gameData: GameData;
  declare betsRepository: mongoose.Model<IBet>;
  async upsertBet(
    player: any,
    roundId: number,
    bet: any,
    rate: number,
    applicableInterceptors: any,
  ) {
    const odds = this.gameData.odds;
    let newBet = {
      uid: player.UID,
      name: player.profile.name,
      time: new Date(),
      odds: odds,
      roundId,
      clientSeed: bet.clientSeed,
    } as any;

    // Transform bet record with interceptors
    if (applicableInterceptors) {
      newBet = this.executeInterceptorTransform(
        "enhanceBetRecord",
        applicableInterceptors,
        {
          betRecord: newBet,
          bet,
        },
      );
    }

    const existingBetFilter = { uid: player.UID, roundId };
    const existingBetIncrement = {
      [bet.betChoice]: bet.amount,
      totalAmount: bet.amount,
    };

    if (player.session) {
      newBet.siteId = player.session.siteId;
      newBet.currency = player.session.currencyName;
      newBet.rate = rate;
      newBet.operatorId = player.session.operatorId;
      newBet.playerId = player.session.playerId;
      newBet.appType = player.session.system;
      newBet.siteName = player.session.siteName;
    }

    await this.betsRepository.updateOne(
      existingBetFilter,
      { $inc: existingBetIncrement, $setOnInsert: newBet },
      { upsert: true, setDefaultsOnInsert: true },
    );

    return newBet.time;
  }
}
