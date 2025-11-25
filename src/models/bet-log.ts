import mongoose from "mongoose";
import { GAME_NAME } from "../constants.js";
import { IBetLog } from "./interfaces/bet-log.js";
import { betLogSchema } from "./schemas/bet-log-schema.js";

const modelName = `${GAME_NAME}_betlogs`;

export default mongoose.models[modelName] ||
  mongoose.model<IBetLog>(modelName, betLogSchema);
