import mongoose from "mongoose";

export interface ISaveResource extends Document {
    user: mongoose.Types.ObjectId;
    resource: mongoose.Types.ObjectId;
    resourceType: "Post" | "Quiz";
}