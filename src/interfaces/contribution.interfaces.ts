import mongoose from "mongoose";

export interface IContibuttion extends Document {
    actor: {
        user: mongoose.Types.ObjectId;
        name: string;
        email: string;
        role: 'ROLE_ADMIN' | 'ROLE_MOD' | 'ROLE_USER'
    };
    target?: {
        entityType: 'Post' | 'Wiki' | 'Project' | 'ListPublic';
        entityId: mongoose.Types.ObjectId;
        name: string;
    };
}