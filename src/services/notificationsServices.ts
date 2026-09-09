import mongoose from "mongoose";
import { NewNotificationI } from "../interfaces/notification.interfaces";
import Notification from "../models/Notification";
import { getAdminsSocketId, getReceiverSocketId, io } from "../socketIO/server";
import { ServiceException } from "../utils/exception/ServiceException";
import User from "../models/User";


// send new notificarion
const sendNotificationService = async (data: NewNotificationI) => {

    // check if user doesn't put like before
    if (data.isCheck) {
        const existing = await Notification.findOne({
            recipientId: data.recipientId,
            senderId: data.senderId,
            entityId: data.entityId,
            type: data.type,
        });

        if (existing) return null;
    }

    // 1. build a notification like and save
    const newNotification = await Notification.create({
        recipientId: data.recipientId,
        senderId: data.senderId,
        type: data.type,
        entityId: data.entityId,
        entityType: data.entityType,
        message: data.message,
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

// change status
const changeStateToReadService = async (notificationId: string) => {

    // 1. get notifications
    const notification = await Notification.findById(notificationId);

    if (!notification) {
        throw new ServiceException("This notification doesn't exists", 404);
    }

    // 2. update notification
    await Notification.findByIdAndUpdate(notificationId,
        {
            $set: { 'isRead': true },
        },
    );

}

// get notifications paginated
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

// send new notificarion
const sendNotificationUserBannedService = async (userId: string) => {


    // 1. check if user is not banned
    const user = await User.findById(userId);
    if (!user) {
        throw new ServiceException("User not found..", 404);
    }

    // evit send notfiication if user is already banned
    if (user?.status === 'BANNED') {
        throw new ServiceException("This users is already banned.", 400);
    }

    // 2. change status
    user.status = 'BANNED';
    await user.save();

    // SEND NOTIFICATION ONLY IF USER IS ONLINE
    const receiverSocketId = getReceiverSocketId(userId);
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("closeSession", {
            message: "You has been banned"
        });
    }


}

const sendNotificationNewActionModerLogService = async (userId: string, newLog: any) => {

    // 1. check if user is not banned
    const user = await User.findById(userId);
    if (!user) {
        throw new ServiceException("User not found..", 404);
    }
    console.log("***");
    console.log("sen new log");
    // SEND NOTIFICATION ONLY IF USER IS ONLINE
    console.log("yes, user is active");
    io.to('admins-room').emit("newLog", newLog);
}

export default {
    sendNotificationService,
    getNotificationsByUserService,
    changeStateToReadService,
    sendNotificationUserBannedService,
    sendNotificationNewActionModerLogService
}