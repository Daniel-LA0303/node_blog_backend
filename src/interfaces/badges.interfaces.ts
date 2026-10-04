import { Types } from "mongoose";

export interface IBadgeCondition extends Document{
    type:
        | 'BLOG_COUNT'
        | 'COMMENT_COUNT'
        | 'QUIZ_COUNT'
        | 'FOLLOWER_COUNT'
        | 'QUIZ_SCORE'
        | 'QUIZ_COUNT'
        | 'PROJECT_COUNT'
        | 'LIST_COUNT'
        | 'COLLABORATION_COUNT'

    value: number;
}

export interface IBadge extends Document{
    name: string;
    description: string;
    icon: string;
    img: string;
    type: 'ACHIEVEMENT';
    condition: IBadgeCondition;
    status: 'ACTIVE' | 'HIDDEN' | 'DELETED';
    createdBy: Types.ObjectId;
}

export interface IUserBadge extends Document{
    user: Types.ObjectId;
    badge: Types.ObjectId;

    awardedAt: Date;

    isDisplayed: boolean;
}

export interface IUpdateBadge {
    name: string;
    description: string;
    img: string;
    condition: IBadgeCondition;
    status: 'ACTIVE' | 'HIDDEN' | 'DELETED';
}

export interface ICreateBadge {
    name: string;
    description: string;
    img: string;
    condition: IBadgeCondition;
    createdBy: Types.ObjectId;
}