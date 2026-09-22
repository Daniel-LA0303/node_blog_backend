import mongoose from "mongoose";


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
    type: string,
    entity: string,
    entityId: mongoose.Types.ObjectId;
}

export interface CrateProjectRequestI {
    name: string;
    description: string;
    owner: string;
}

export interface UpdateProjectRequestI {
    name: string;
    description: string;
}

export interface CreateListRequestI {
    project: string;
    name: string,
    position: number,
}

export interface UpdateListRequestI {
    name: string,
    position: number,
}

export interface CreateProjectTaskRequestI {
    project: string;
    list: string;
    title: string,
    description: string,
    position: number,
    assignedTo?: mongoose.Types.ObjectId;
    createdBy?: mongoose.Types.ObjectId;
}

export interface UpdateProjectTaskRequestI {
    title: string,
    description: string,
    position: number,
}

export type ProjectMemberStatus = "ACTIVE" | "REMOVED";

export interface UpdateProjectMemberRequestI {
    projectId: string;
    userId: string;
    status: ProjectMemberStatus;
}
