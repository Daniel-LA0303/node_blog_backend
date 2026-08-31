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
        reason: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
        },
        status: {
            type: String,
            enum: ['PENDING', 'RESOLVED', 'DISMISSED'],
            default: 'PENDING'
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

