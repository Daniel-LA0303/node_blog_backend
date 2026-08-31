import { Types } from "mongoose";

interface IFollows {
  countFollows: number;
  users: Types.ObjectId[];
}

// document interface
export interface ICategory extends Document {
  name: string;
  value: string;
  label: string;
  color?: string;
  desc?: string;
  longDesc: string;
  follows: IFollows;
}

export interface ICreateCategory {
  name: string;
  color: string;
  desc: string;
  value: string;
  label: string;
  longDesc: string
}