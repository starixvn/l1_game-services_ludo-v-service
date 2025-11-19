import { Schema } from "mongoose";
import { IResult } from "../interfaces/result.js";

export const resultSchema = new Schema<IResult>(
  {
    dice: { type: [Number], required: true },
    action: { type: String, required: true },
    playerColor: { type: Number, required: true },
    boardState: { type: Object, required: true },
    kickedPlayer: { type: Number, required: false },
  },
  { _id: false },
);
