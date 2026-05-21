import mongoose, {HydratedDocument, Model, Schema } from "mongoose";
import Reply from "./Replies";
import { IComment } from "../interfaces/comments.interfaces";

const commentSchema = new Schema<IComment>({
  userID: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  comment: {
    type: String,
  },

  dateComment: {
    type: Date,
    default: Date.now,
  },

  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: "Reply",
    },
  ],

  postID: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },
});



commentSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (
    this: HydratedDocument<IComment>,
    next
  ) {
    try {
      await Reply.deleteMany({ commentID: this._id });

      next();
    } catch (err) {
      next(err as Error);
    }
  }
);

const Comment: Model<IComment> = mongoose.model<IComment>(
  "Comment",
  commentSchema
);

export default Comment;