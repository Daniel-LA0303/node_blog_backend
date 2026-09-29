import mongoose, { Model } from "mongoose";
import { IStudyList } from "../interfaces/lists.interfaces";

const StudyListSchema = new mongoose.Schema<IStudyList>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500
    },

    status: {
      type: String,
      enum: [
        'ACTIVE',
        'HIDDEN',
        'DELETED'
      ],
      default: 'ACTIVE',
      index: true
    }
  },
  {
    timestamps: true
  }
);

StudyListSchema.index({ owner: 1, status: 1 });

const StudyList: Model<IStudyList> = mongoose.model<IStudyList>(
  "StudyList",
  StudyListSchema
);

export default StudyList;