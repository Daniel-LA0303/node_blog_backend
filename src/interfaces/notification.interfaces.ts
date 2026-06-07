import { Types } from "mongoose";
import { EntityType, NotificationType } from "../enums/notifications.enums";


export interface NotificationI {
    recipientId: Types.ObjectId;
    senderId: Types.ObjectId;
    type: NotificationType;
    entityId: Types.ObjectId; 
    entityType: EntityType;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export interface NewNotificationI {
    recipientId: Types.ObjectId;
    senderId: Types.ObjectId;
    entityId: Types.ObjectId; 
    message: string;
    entityType: EntityType;
    type: NotificationType;
    isCheck: boolean; // check if is a type notification can not repeat like when user get like or follow a user
}