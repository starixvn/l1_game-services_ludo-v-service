import { Schema } from "mongoose";
import { ISettlementResult } from "../interfaces/settlement-result.js";

export const settlementResultSchema = new Schema<ISettlementResult>(
  {
    odd: { type: Boolean },
    even: { type: Boolean },
    big: { type: Boolean },
    small: { type: Boolean },
    kick: { type: Boolean },
    noKick: { type: Boolean },
  },
  { _id: false },
);
