import mongoose from "mongoose";
import { ISettlementResult } from "../interfaces/settlement-result.js";

export const settlementResultSchema = new mongoose.Schema<ISettlementResult>(
  {
    odd: { type: Boolean },
    even: { type: Boolean },
    big: { type: Boolean },
    small: { type: Boolean },
    kick: { type: Boolean },
    noKick: { type: Boolean },
    move: { type: Boolean },
    noMove: { type: Boolean },
    release: { type: Boolean },
    noRelease: { type: Boolean },
    goStable: { type: Boolean },
    noStable: { type: Boolean },
  },
  { _id: false },
);
