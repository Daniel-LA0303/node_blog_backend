import mongoose, { Model } from "mongoose";
import { IStudyListItem } from "../interfaces/lists.interfaces";


const StudyListItemSchema = new mongoose.Schema<IStudyListItem>(
  {
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyList',
      required: true,
      index: true
    },

    resourceType: {
      type: String,
      enum: [
        'POST',
        'QUIZ'
      ],
      required: true
    },

    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    order: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

StudyListItemSchema.index({
  listId: 1,
  order: 1
});

StudyListItemSchema.index({
  listId: 1,
  resourceType: 1,
  resourceId: 1
});

const StudyListItem: Model<IStudyListItem> = mongoose.model<IStudyListItem>(
  "StudyListItem",
  StudyListItemSchema
);

export default StudyListItem;