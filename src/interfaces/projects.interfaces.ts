import mongoose from "mongoose";
import { ActionProject } from "../enums/projects.enums";


export interface IProject extends Document {
    name: string;
    description: string;
    owner: mongoose.Types.ObjectId;
    status: "ACTIVE" | "ARCHIVED" | "DELETED";
    deletedAt: Date;
}

export interface IProjectMembers extends Document {
    project: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    role: 'MEMBER';
    joinedAt: Date;
    status: "ACTIVE" | "REMOVED";
}

export interface IProjectList extends Document {
    project: mongoose.Types.ObjectId;
    name: string,
    position: number,
}

export interface IProjectTask extends Document {
    project: mongoose.Types.ObjectId;
    list: mongoose.Types.ObjectId;
    title: string,
    description: string,
    position: number,
    assignedTo: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    status: "ACTIVE" | "DELETED",
}

export interface IProjectEvent extends Document {
    project: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    description: string;
    type: 'ACTION' | 'UPDATED',
    entity: 'ProjectList' | 'Project' | 'ProjectTask' | 'ProjectMember',
    entityId: mongoose.Types.ObjectId;
}

export interface CreateEventI {
    project: string;
    user?: string;
    type: ActionProject;
    entity: 'ProjectList' | 'Project' | 'ProjectTask' | 'ProjectMember';
    entityId: string;
}

export interface CrateProjectRequestI {
    name: string;
    description: string;
    owner: string;
    userAction?: string
}

export interface UpdateProjectRequestI {
    name: string;
    description: string;
    userAction?: string
}

export interface CreateListRequestI {
    project: string;
    name: string;
    position: number;
    userAction?: string;
}

export interface UpdateListRequestI {
    name: string;
    position: number;
    userAction?: string
}

export interface CreateProjectTaskRequestI {
    project: string;
    list: string;
    title: string;
    description: string;
    position: number;
    assignedTo?: mongoose.Types.ObjectId;
    createdBy?: mongoose.Types.ObjectId;
    userAction?: string
}

export interface UpdateProjectTaskRequestI {
    title?: string;
    description?: string;
    position?: number;
    list?: string;
    userAction?: string;
}

export type ProjectMemberStatus = "ACTIVE" | "REMOVED";

export interface UpdateProjectMemberRequestI {
    projectId: string;
    userId: string;
    status: ProjectMemberStatus;
    userAction?: string
}
