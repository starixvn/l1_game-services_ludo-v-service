import { IResult } from "./result.js";

export interface IMatch {
  id: number;
  turns: IResult[];
  startTime: Date;
  endTime?: Date;
}
