import { TurnResult } from "@rd/ludo-rules";
import { Schema } from "mongoose";
import { IResult } from "../interfaces/result.js";

const turnResultSchema = new Schema<TurnResult>(
  {
    raceMap: { type: Object, required: true },
    stableMap: { type: Object, required: true },
    startingAreaMap: { type: Object, required: true },
    kickedPlayer: { type: Number, required: true },
  },
  { _id: false },
);

export const resultSchema = new Schema<IResult>(
  {
    dice: { type: [Number], required: true },
    action: { type: String, required: true },
    playerColor: { type: Number, required: true },
    boardState: { type: turnResultSchema, required: true },
  },
  { _id: false },
);
