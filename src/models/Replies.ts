import mongoose, { Model, Schema } from "mongoose";
import { IReply } from "../interfaces/replies.interfaces";

const replySchema = new Schema<IReply>({
  userID: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  postID: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },

  commentID: {
    type: Schema.Types.ObjectId,
    ref: "Comment",
  },

  reply: {
    type: String,
  },

  dateReply: {
    type: Date,
    default: Date.now,
  },
});

const Reply: Model<IReply> = mongoose.model<IReply>(
  "Reply",
  replySchema
);

export default Reply;