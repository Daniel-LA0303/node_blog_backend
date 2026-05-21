import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { ICategory } from "../interfaces/categories.interfaces";


const CategoriesSchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    value: {
      type: String,
      required: true,
      unique: true,
    },

    label: {
      type: String,
      required: true,
      unique: true,
    },

    color: {
      type: String,
    },

    desc: {
      type: String,
    },

    longDesc: {
      type: String,
      default: "",
    },

    follows: {
      countFollows: {
        type: Number,
        default: 0,
      },

      users: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Categories: Model<ICategory> = mongoose.model<ICategory>(
  "Categories",
  CategoriesSchema
);

export default Categories;