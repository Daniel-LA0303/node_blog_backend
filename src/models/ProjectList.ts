import mongoose, { Schema } from "mongoose";
import { IProjectList } from "../interfaces/projects.interfaces";


const ProjectListSchema = new Schema<IProjectList>(
    {
        project: {
            type: Schema.Types.ObjectId,
        },
        name: {
            type: String
        },
        position: {
            type: Number
        }
    },
    {
        timestamps: true
    }
);

export const ProjectList = mongoose.model<IProjectList>('ProjectList', ProjectListSchema);