import mongoose from "mongoose";
import { IBet } from "../interfaces/bet.js";
import { tempBetSchema } from "./temp-bet-schema.js";

export const betSchema = new mongoose.Schema<IBet>({
  totalAmount: { type: Number, required: true },
  currency: { type: String, required: true },
  rate: { type: Number, required: true },
});

betSchema.add(tempBetSchema);
