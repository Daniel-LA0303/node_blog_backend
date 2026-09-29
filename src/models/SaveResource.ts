import mongoose, { Model, Schema } from "mongoose";
import { ISaveResource } from "../interfaces/global.interfaces";

const SaveResourceSchema = new Schema<ISaveResource>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    resourceType: {
      type: String,
      enum: ['Post', 'Quiz'],
      required: true
    },
    resource: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'resourceType'
    }
  },
  {
    timestamps: true
  }
)

const SaveResource: Model<ISaveResource> = mongoose.model<ISaveResource>(
  "SaveResource",
  SaveResourceSchema
);

export default SaveResource;
