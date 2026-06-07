import mongoose, { Model, mongo, Schema } from "mongoose";
import { NotificationI } from "../interfaces/notification.interfaces";
import { EntityType, NotificationType } from "../enums/notifications.enums";

const notificationSchema = new Schema<NotificationI>(
    {
        recipientId: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        type: {
            type: String,
            enum: Object.values(NotificationType),
            required: true
        },
        entityId: {
            type: Schema.Types.ObjectId,
            // without refence 'cause we don't know what type it is
            required: true
        },
        entityType: {
            type: String,
            enum: Object.values(EntityType),
            required: true
        }, 
        message: {
            type: String,
            required: true
        },
        isRead: {
            type: Boolean,
            required: true
        },
    },
    {
        timestamps: true
    }
)

const Notification: Model<NotificationI> = mongoose.model<NotificationI>(
    "Notification",
    notificationSchema
)

export default Notification;