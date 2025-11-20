import { Schema } from "mongoose";
import { IResult } from "../interfaces/result.js";

const actionSchema = new Schema(
  {
    oldPosition: { type: Number, required: true },
    newPosition: { type: Number, required: true },
  },
  { _id: false },
);

export const resultSchema = new Schema<IResult>(
  {
    board: { type: Object, required: true },
    nextTurnIndex: { type: Number, required: true },
    currentPlayers: { type: [Number], required: true },
    winners: { type: [Number], required: true },
    action: { type: actionSchema, required: true },
    dice: { type: [Number], required: true },
    kickedPlayer: { type: Number, required: false },
  },
  { _id: false },
);
