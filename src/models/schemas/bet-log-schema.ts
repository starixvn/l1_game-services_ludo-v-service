import mongoose from "mongoose";
import { IBetLog } from "../interfaces/bet-log.js";

export const betLogSchema = new mongoose.Schema<IBetLog>({
  uid: { type: String, required: true },
  name: { type: String, required: true },
  time: { type: Date, required: true },
  choice: { type: String, required: true },
  amount: { type: Number, required: true },
  clientSentTime: { type: Date, required: true },
  receivedTime: { type: Date, required: true },
  roundId: { type: Number, required: true },
});
