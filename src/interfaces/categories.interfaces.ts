import { Types } from "mongoose";

interface IFollows {
  countFollows: number;
  users: Types.ObjectId[];
}

export interface ICategory extends Document {
  name: string;
  value: string;
  label: string;
  color?: string;
  desc?: string;
  longDesc: string;
  follows: IFollows;
}