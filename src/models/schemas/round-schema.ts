import mongoose from "mongoose";
import { IRound } from "../interfaces/round.js";
import { resultSchema } from "./result-schema.js";
import { settlementResultSchema } from "./settlement-result-schema.js";

export const roundSchema = new mongoose.Schema<IRound>({
  id: { type: Number, required: true },
  result: { type: resultSchema, required: true },
  settlementResult: { type: settlementResultSchema, required: true },
  time: { type: Date, required: true },
  exchangeRateId: { type: Number, required: true },
  initRoundId: { type: Number },
});
