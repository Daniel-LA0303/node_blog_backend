import { Types } from "mongoose";

export interface IReply extends Document {
  userID: Types.ObjectId;
  postID: Types.ObjectId;
  commentID: Types.ObjectId;
  reply: string;
  dateReply: Date;
}
