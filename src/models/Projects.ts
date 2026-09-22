import mongoose, { Schema } from "mongoose";
import { IProject } from "../interfaces/projects.interfaces";

const ProjectSchema = new Schema<IProject>(
    {
        name: {
            type: String
        },
        description: {
            type: String
        },
        owner: {
            type: Schema.Types.ObjectId,
        },
        status: {
            enum:["ACTIVE", "ARCHIVED", "DELETED"],
            default: 'ACTIVE'
        },
        deletedAt:{
            type: Date
        }
    },
    {
        timestamps: true
    }
);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);