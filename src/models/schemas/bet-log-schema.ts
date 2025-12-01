import mongoose from "mongoose";
import { IBetLog } from "../interfaces/bet-log.js";

export const betLogSchema = new mongoose.Schema<IBetLog>({
  uid: { type: String, required: true },
  name: { type: String, required: true },
  time: { type: Date, required: true },
  choice: { type: String, required: true },
  amount: { type: Number, required: true },
  clientSentTime: { type: Date },
  receivedTime: { type: Date, required: true },
  siteId: { type: String },
  operatorId: { type: String, required: true },
  freeBet: { type: Boolean, default: false },
  playerId: { type: String, required: true },
  currency: { type: String, required: true },
  rate: { type: Number, required: true },
  roundId: { type: Number, required: true },
});
