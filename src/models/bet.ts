import mongoose from "mongoose";
import { GAME_NAME } from "../constants.js";
import { IBet } from "./interfaces/bet.js";
import { betSchema } from "./schemas/bet-schema.js";

const modelName = `${GAME_NAME}_bets`;

export default mongoose.models[modelName] ||
  mongoose.model<IBet>(modelName, betSchema);
