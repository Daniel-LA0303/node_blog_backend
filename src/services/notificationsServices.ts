import mongoose from "mongoose";
import { EntityType, NotificationType } from "../enums/notifications.enums";
import { NewNotificationI } from "../interfaces/notification.interfaces";
import Notification from "../models/Notification";
import Post from "../models/Post";
import { getReceiverSocketId, io } from "../socketIO/server";
import User from "../models/User";


const likeNotification = async (data: NewNotificationI) => {

    // check if user doesn't put like before
    const existing = await Notification.findOne({
        recipientId: data.recipientId,
        senderId:    data.senderId,
        entityId:    data.entityId,
        type:        NotificationType.LIKE_POST,
    });

    if (existing) return null;

    const user = await User.findById(data.recipientId);

    const post = await Post.findById(data.entityId);

    // 1. build a notification like and save
    const newNotification = await Notification.create({
        recipientId: data.recipientId,
        senderId: data.senderId,
        type: NotificationType.LIKE_POST,
        entityId: data.entityId,
        entityType: EntityType.POST,
        message: user?.name + " like your post " + post?.title + "!",
        isRead: false
    });

    const notification = await Notification.
    findById(newNotification._id)
    .populate({
        path: 'senderId',
        select: 'name _id profilePicture'
    })
    .select('type entityId type message isRead createdAt');

    // SEND NOTIFICATION ONLY IF USER IS ONLINE
    const receiverSocketId = getReceiverSocketId(data.recipientId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newNotification", notification?.toJSON());
    }    
}

const getNotificationsByUserService = async (page: number = 1, limit: number = 5, userId: string) => {

    // 1. calculate
    const skip = (page - 1) * limit;

    // 2. get notifications
    const notifications = await Notification.find(
        { recipientId: new mongoose.Types.ObjectId(userId) },
    )
    .skip(skip)
    .limit(limit)
    .populate({
        path: 'senderId',
        select: 'name _id profilePicture'
    })
    .select('type entityId type message isRead createdAt')
    .sort({ createdAt: -1 });

    // 3. calculate total
    const total = await Notification.countDocuments({ recipientId: userId });

    return {
        data: notifications,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }

}

export default {
    likeNotification,
    getNotificationsByUserService
}