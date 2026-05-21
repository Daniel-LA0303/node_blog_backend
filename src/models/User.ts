import bcrypt from "bcryptjs";
import mongoose, { Model, Schema } from "mongoose";
import { IUser } from "../interfaces/user.interfaces.js";

const usersSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    token: {
      type: String,
    },

    confirm: {
      type: Boolean,
      default: false,
    },

    profilePicture: {
      secure_url: {
        type: String,
        default: "",
      },

      public_id: {
        type: String,
        default: "",
      },
    },

    numberPost: {
      type: Number,
      default: 0,
    },

    info: {
      desc: {
        type: String,
        default: "",
      },

      work: {
        type: String,
        default: "",
      },

      education: {
        type: String,
        default: "",
      },

      skills: {
        type: [String],
        default: [],
      },

      social: {
        facebook: {
          type: String,
          default: "",
        },

        twitter: {
          type: String,
          default: "",
        },

        instagram: {
          type: String,
          default: "",
        },

        youtube: {
          type: String,
          default: "",
        },

        linkedin: {
          type: String,
          default: "",
        },
      },
    },

    likePost: {
      reactions: {
        type: Number,
        default: 0,
      },

      posts: [
        {
          type: Schema.Types.ObjectId,
          ref: "Post",
        },
      ],
    },

    postsSaved: {
      saved: {
        type: Number,
        default: 0,
      },

      posts: [
        {
          type: Schema.Types.ObjectId,
          ref: "Post",
        },
      ],
    },

    followsTags: {
      countTags: {
        type: Number,
        default: 0,
      },

      tags: [
        {
          type: Schema.Types.ObjectId,
          ref: "Categories",
        },
      ],
    },

    followersUsers: {
      conutFollowers: {
        type: Number,
        default: 0,
      },

      followers: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },

    followedUsers: {
      conutFollowed: {
        type: Number,
        default: 0,
      },

      followed: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },

    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    notifications: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },

        notification: {
          type: String,
        },

        type: {
          type: String,
        },

        date: {
          type: Date,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

usersSchema.methods.checkPassword = async function (
  passwordForm: string
): Promise<boolean> {
  return await bcrypt.compare(passwordForm, this.password);
};


const User: Model<IUser> = mongoose.model<IUser>("User", usersSchema);

export default User;