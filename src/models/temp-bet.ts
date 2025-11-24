import mongoose from "mongoose";
import { GAME_NAME } from "../constants.js";
import { ITempBet } from "./interfaces/temp-bet.js";
import { tempBetSchema } from "./schemas/temp-bet-schema.js";

const modelName = `${GAME_NAME}_tmpbets`;

export default mongoose.models[modelName] ||
  mongoose.model<ITempBet>(modelName, tempBetSchema);
