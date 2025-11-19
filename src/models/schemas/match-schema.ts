import { Schema } from "mongoose";
import { IMatch } from "../interfaces/match.js";
import { resultSchema } from "./result-schema.js";

export const matchSchema = new Schema<IMatch>({
  id: { type: Number, required: true },
  turns: { type: [resultSchema], required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: false },
});
