import mongoose, { Schema } from "mongoose";
import { IProjectMembers } from "../interfaces/projects.interfaces";


const ProjectMemberSchema = new Schema<IProjectMembers>(
    {
        project: {
            type: Schema.Types.ObjectId,
        },
        user: {
            type: Schema.Types.ObjectId,
        },
        role: {
            type: String,
            default: "MEMBER"
        },
        joinedAt:{
            type: Date,
            default: Date.now
        },
        status:{
            type: String,
            enum: ["ACTIVE", "REMOVED"],
            default: 'ACTIVE'
        }
    },
    {
        timestamps: true
    }
);

export const ProjectMember = mongoose.model<IProjectMembers>('ProjectMember', ProjectMemberSchema);