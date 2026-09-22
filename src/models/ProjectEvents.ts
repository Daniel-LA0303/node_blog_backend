import mongoose, { Schema } from "mongoose";
import { IProjectEvent } from "../interfaces/projects.interfaces";


const ProjectEventsSchema = new Schema<IProjectEvent>(
    {
        project: {
            type: Schema.Types.ObjectId,
        },
        user: {
            type: Schema.Types.ObjectId,
        },
        type: {
            type: String
        },
        entity: {
            type: String
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