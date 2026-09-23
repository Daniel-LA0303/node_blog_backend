import mongoose, { Schema } from "mongoose";
import { IProjectTask } from "../interfaces/projects.interfaces";


const ProjectTaskSchema = new Schema<IProjectTask>(
    {
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project'
        },
        list: {
            type: Schema.Types.ObjectId,
            ref: 'ProjectList'
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
            ref: 'User'
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            default: null,
            ref: 'User'
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