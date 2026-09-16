import mongoose, { Schema } from "mongoose";
import { IContibuttion } from "../interfaces/contribution.interfaces";

const ContributionSchema = new Schema<IContibuttion>(
    {
        actor: {
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
            name: { type: String, required: true },
            email: { type: String, required: true },
            roles: [{
                type: String,
                enum: ['ROLE_ADMIN', 'ROLE_MOD', 'ROLE_USER'],
                required: true
            }]
        },
        target: {
            entityType: {
                type: String,
                enum: ['User', 'Post', 'Categories', 'Comment']
            },
            entityId: {
                type: Schema.Types.ObjectId,
                refPath: 'target.entityType',
                index: true
            },
            name: {
                type: String
            }
        },
    },
    {timestamps: true}
);

export const Contribution = mongoose.model<IContibuttion>('Contribution', ContributionSchema);