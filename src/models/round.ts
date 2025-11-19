import mongoose from "mongoose";
import { GAME_NAME } from "../constants.js";
import { IRound } from "./interfaces/round.js";
import { roundSchema } from "./schemas/round-schema.js";

const modelName = `${GAME_NAME}_rounds`;

export default mongoose.models[modelName] ||
  mongoose.model<IRound>(modelName, roundSchema);
