import mongoose, {
  HydratedDocument,
  Model,
  Schema
} from "mongoose";

import User from "./User";
import Reply from "./Replies";
import Comment from "./Comments";
import { IPost } from "../interfaces/post.interfaces";

const postSchema = new Schema<IPost>(
  {
    // user
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    // title
    title: {
      type: String,
      required: true,
      unique: true,
    },

    // description
    desc: {
      type: String,
      required: true,
    },

    // content
    content: {
      type: String,
      required: true,
    },

    // image in cloudinary
    linkImage: {
      secure_url: {
        type: String,
        default: "",
      },

      public_id: {
        type: String,
        default: "",
      },
    },

    // categories select
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Categories",
        required: false,
      },
    ],

    // like post
    likePost: {
      users: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },

    // comments on post
    commenstOnPost: {
      numberComments: {
        type: Number,
        default: 0,
      },

      comments: [
        {
          userID: {
            type: Schema.Types.ObjectId,
            ref: "User",
          },

          comment: {
            type: String,
          },

          dateComment: {
            type: String,
          },

          replies: [
            {
              userID: {
                type: Schema.Types.ObjectId,
                ref: "User",
              },

              reply: {
                type: String,
              },

              dateReply: {
                type: String,
              },
            },
          ],
        },
      ],
    },

    // users that saved this post
    usersSavedPost: {
      users: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },

    // date
    date: {
      type: Number,
      required: false,
    },

    // comments
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
  }
);

postSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (
    this: HydratedDocument<IPost>,
    next
  ) {
    try {
      // Delete related comments and replies
      await Comment.deleteMany({ postID: this._id });

      await Reply.deleteMany({ postID: this._id });

      // Remove post from liked posts
      await User.updateMany(
        { "likePost.posts": this._id },
        {
          $pull: {
            "likePost.posts": this._id,
          },
        }
      );

      // Remove post from saved posts
      await User.updateMany(
        { "postsSaved.posts": this._id },
        {
          $pull: {
            "postsSaved.posts": this._id,
          },
        }
      );

      next();
    } catch (err) {
      next(err as Error);
    }
  }
);


const Post: Model<IPost> = mongoose.model<IPost>(
  "Post",
  postSchema
);

export default Post;