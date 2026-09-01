import { Types } from "mongoose";


export interface IReport extends Document {
    targetType: 'User' | 'Post';     // What type of item is reported
    targetId: Types.ObjectId;        // The ID of the user or post
    reason: 'SPAM' | 'SENSITIVE_INFO' | 'HARASSMENT' | 'OTHER';
    description?: string;
    status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
    reportedBy: Types.ObjectId; 
}

export interface ICreateReport {
    targetType: string;
    targetId: string;
    reason: string;
    description?: string;
    status:string;
    reportedBy: string
}