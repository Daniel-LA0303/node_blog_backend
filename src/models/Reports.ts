import mongoose, { Model, Schema } from "mongoose";
import { IReport } from "../interfaces/reports.interfaces";

const ReportsSchema = new Schema<IReport>(
    {
        targetType: {
            type: String,
            enum: ['User', 'Post'],
            required: true
        },
        targetId: {
            type: Schema.Types.ObjectId,
            refPath: 'targetType', // Dynamically references User or Post based on targetType
            required: true
        },
        reasonUser: { // write by user to know admin
            type: String, 
            required: false,
            default: ""
        },
        reasonUserType: {
            type: String,
            required: true,
            enum: ['SPAM', 'SENSITIVE_INFO', 'HARASSMENT', 'OTHER'],
            default: 'OTHER'
        },
        reason: { // write by admin, this information is sendig to use via email
            type: String,
            required: false,
            default: ""
        },
        description: {
            type: String,
            required: false,
            default: ""
        },
        status: {
            type: String,
            enum: ['PENDING', 'RESOLVED', 'DISMISSED'],
            default: 'PENDING'
        },
        reportedBy: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
        }
    },
    {
        timestamps: true,
    }
);

const Reports: Model<IReport> = mongoose.model<IReport>(
    "Reports",
    ReportsSchema
);

export default Reports;

