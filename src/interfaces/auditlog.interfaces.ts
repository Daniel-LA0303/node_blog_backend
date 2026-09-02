import mongoose from "mongoose"

export interface IAuditLog extends Document {
    actor: {
        user: mongoose.Types.ObjectId;
        name: string;
        email: string;
        role: 'ROLE_ADMIN' | 'ROLE_MOD' | 'ROLE_USER'
    };
    action: string;
    category: 'AUTH' | 'MODERATION' | 'CONTENT' | 'SYSTEM'
    target?: {
        entityType: 'User' | 'Post' | 'Categories' | 'Comment';
        entityId: mongoose.Types.ObjectId;
        name: string;
    };
    details?: Record<string, any>;
    ipAddress?: string;

}

export interface LogInput {
    actor: {
        _id: any;
        name: string;
        email: string;
        roles: string[];
    }
    action: string;
    category: 'AUTH' | 'MODERATION' | 'CONTENT' | 'SYSTEM';
    target?: {
        entityType: 'User' | 'Post' | 'Categories' | 'Comment';
        entityId: any;
        name: string;
    }
    req?: any;
}