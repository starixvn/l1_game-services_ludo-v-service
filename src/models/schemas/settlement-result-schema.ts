import { Schema } from "mongoose";
import { ISettlementResult } from "../interfaces/settlement-result.js";

export const settlementResultSchema = new Schema<ISettlementResult>(
  {
    odd: { type: Boolean, required: true },
    even: { type: Boolean, required: true },
    big: { type: Boolean, required: true },
    small: { type: Boolean, required: true },
    kick: { type: Boolean, required: true },
    noKick: { type: Boolean, required: true },
  },
  { _id: false },
);
