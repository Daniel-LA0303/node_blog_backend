import mongoose, { Schema } from "mongoose";
import { IProjectTask } from "../interfaces/projects.interfaces";


const ProjectTaskSchema = new Schema<IProjectTask>(
    {
        project: {
            type: Schema.Types.ObjectId,
        },
        list: {
            type: Schema.Types.ObjectId,
        },
        title: {
            type: String
        },
        description: {
            type: String
        },
        position: {
            type: Number
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            default: null
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'DELETED'],
            default: 'ACTIVE'
        }
    },
    {
        timestamps: true
    }
);

export const ProjectTask = mongoose.model<IProjectTask>('ProjectTask', ProjectTaskSchema);