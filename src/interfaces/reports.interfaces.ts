import { Types } from "mongoose";


export interface IReport extends Document {
    targetType: 'User' | 'Post';     // What type of item is reported
    targetId: Types.ObjectId;        // The ID of the user or post
    reasonUser: string;
    reasonUserType: 'SPAM' | 'SENSITIVE_INFO' | 'HARASSMENT' | 'OTHER';
    reason: string;
    description?: string;
    status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
    reportedBy: Types.ObjectId; 
}

export interface ICreateReport {
    targetType: string;
    targetId: string;
    reasonUser: string;
    reasonUserType: string
    description?: string;
    reportedBy: string
}

export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export interface INewStatusReport{
    reportId: string;
    status: ReportStatus;
}