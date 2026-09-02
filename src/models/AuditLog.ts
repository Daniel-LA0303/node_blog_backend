import mongoose, { Schema } from "mongoose";
import { IAuditLog } from "../interfaces/auditlog.interfaces";
import { ref } from "node:process";


const AuditLogSchema = new Schema<IAuditLog>(
    {
        actor: {
            user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
            name: { type: String, required: true },
            email: { type: String, required: true },
            roles: [{
                type: String,
                enum: ['ROLE_ADMIN', 'ROLE_MOD', 'ROLE_USER'],
                required: true
            }]
        },
        action: {
            type: String,
            required: true,
            index: true
        },
        category: {
            type: String,
            enum: ['AUTH', 'MODERATION', 'CONTENT', 'SYSTEM'],
            required: true,
            index: true
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
        details: {
            type: Schema.Types.Mixed
        },
        ipAddress: {
            type: String
        }
    }, {
    timestamps: true
}
);

AuditLogSchema.index({ 'actor.role': 1, createdAt: -1 });
AuditLogSchema.index({ category: 1, createdAt: -1 });
AuditLogSchema.index({ 'actor.user': 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);