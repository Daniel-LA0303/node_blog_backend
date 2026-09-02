import mongoose from "mongoose";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import { getReceiverSocketId, io } from "../socketIO/server";
import { SendNewMessageI } from "../interfaces/message.interfaces";

// mark as read
const markMessagesAsReadService = async (userId: any) => {
    return await Message.updateMany(
        { receiverId: userId, read: false },
        { $set: { read: true } }
    );
};

// get un read messages
const getUnreadMessagesCountService = async (userId: string) => {

    const unreadMessagesCount = await Message.countDocuments({
        receiverId: userId,
        read: false,
    });

    return unreadMessagesCount;
}

// send notification via web socket
const sendNotificationNewConversationService = async (receiver: string, conversationId: string) => {
    const receiverSocketId = getReceiverSocketId(receiver);

    const conversation = await Conversation.findById(conversationId)
        .select("_id lastMessage isGroup groupName members createdAt lastMessage")
        .populate("members", "name email profilePicture")
        .populate("lastMessage", "message read createdAt")

    // only send if user is active
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("newConversation", conversation?.toJSON());
    }
}

// send a message
const sendMessageService = async (senderId: string, receiverId: string, body: SendNewMessageI) => {

    let isNew = false;

    const { message, messageType, image, replyTo } = body;

    const receiverObjectId = new mongoose.Types.ObjectId(receiverId); // <-- convert

    // 1. search chat
    let conversation = await Conversation.findOne({
        members: { $all: [senderId, receiverObjectId] },
    });

    if (!conversation) {
        conversation = await Conversation.create({
            members: [senderId, receiverObjectId],
        });
        isNew = true;
    }

    // 2. cretae msg 
    const newMessage = new Message({
        senderId,
        receiverId: receiverObjectId, // save
        message,
        messageType,
        replyTo,
        image,
        conversationId: conversation._id,
        read: false,
    });

    await newMessage.save();
    const populatedMessage = await newMessage.populate([
        { path: "senderId", select: "name email profilePicture" },
        { path: "receiverId", select: "name email profilePicture" },
        {
            path: "replyTo",
            select: "message senderId createdAt messageType image",
            populate: {
                path: "senderId",
                select: "name email profilePicture"
            }
        },
    ]);

    // 3. update last activity in chat
    const newConversation = await Conversation.findByIdAndUpdate(conversation._id, {
        updatedAt: new Date(),
        lastMessage: newMessage._id
    },
        { new: true });

    if (isNew && newConversation?._id) {
        await sendNotificationNewConversationService(receiverObjectId.toString(), newConversation._id.toString());
    }

    // 4. emit if user is active
    const receiverSocketId = getReceiverSocketId(receiverObjectId.toString());
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", populatedMessage.toJSON());
    }

    return populatedMessage;
}

// get message by chat paginated
const getMessagesPaginatedByChatService = async (
    otherUserId: string, currentUserId: string, page: number, limit: number
) => {

    const otherUserObjectId = new mongoose.Types.ObjectId(otherUserId);

    const skip = (page - 1) * limit;
    const conversation = await Conversation.findOne({
        members: { $all: [currentUserId, otherUserObjectId] },
    });

    if (!conversation) {
        return {
            messages: [],
            meta: {
                total: 0,
                page,
                limit,
                totalPages: 0
            }
        };
    }

    // total
    const total = await Message.countDocuments({
        conversationId: conversation._id
    });

    // get recent msgs
    const messages = await Message.find({ conversationId: conversation._id })
        .populate("senderId", "name email profilePicture")
        .populate({
            path: "replyTo",
            select: "message messageType image senderId",
            populate: {
                path: "senderId",
                select: "name email profilePicture"
            }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    await markMessagesAsReadService(currentUserId);

    return {
        messages: messages,
        meta: {
            total: total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }
}


// get chats by user
const getChatsByUserIdService = async (userId: string, page: number, limit: number) => {

    const skip = (page - 1) * limit;

    const query = { members: { $in: [userId] } };

    // 1. Query conversations with populated members
    const rawConversations = await Conversation.find(query)
        .select("_id lastMessage isGroup groupName members createdAt updatedAt")
        .populate({
            path: "members",
            select: "name email profilePicture status"
        })
        .populate("lastMessage", "message read createdAt _id")
        .sort({ updatedAt: -1 });

    // 2. Filter out conversations where ANY member is BANNED
    const validConversations = rawConversations.filter((conv) => {
        // Check if any populated member has status 'BANNED'
        const hasBannedMember = conv.members.some(
            (member: any) => member && member.status === "BANNED"
        );
        return !hasBannedMember;
    });

    // 3. Paginate the filtered array manually
    const total = validConversations.length;
    const paginatedConversations = validConversations.slice(skip, skip + limit);

    return {
        conversations: paginatedConversations,
        meta: {
            total: total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }
}


export default {
    sendMessageService,
    getMessagesPaginatedByChatService,
    getUnreadMessagesCountService,
    getChatsByUserIdService
}