import mongoose, { Schema } from "mongoose";
import { IProjectEvent } from "../interfaces/projects.interfaces";
import { ActionProject } from "../enums/projects.enums";


const ProjectEventsSchema = new Schema<IProjectEvent>(
    {
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project'
        },
        description: {
            type: String,
            default: ''
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        type: {
            type: String,
            enum: ActionProject
        },
        entity: {
            type: String,
            enum: ['ProjectList', 'Project', 'ProjectTask', 'ProjectMember']
        },
        entityId:{
            type: Schema.Types.ObjectId,
        },
    },
    {
        timestamps: true
    }
);


export const ProjectEvent = mongoose.model<IProjectEvent>('ProjectEvent', ProjectEventsSchema);