import { Types } from "mongoose";

export interface IComment extends Document {
  userID: Types.ObjectId;
  comment: string;
  dateComment: Date;
  replies: Types.ObjectId[];
  postID: Types.ObjectId;
}