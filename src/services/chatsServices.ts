import mongoose from "mongoose";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import { getReceiverSocketId, io } from "../socketIO/server";
import { SendNewMessageI } from "../interfaces/message.interfaces";


const markMessagesAsRead = async (userId: any) => {
    return await Message.updateMany(
        { receiverId: userId, read: false },
        { $set: { read: true } }
    );
};

const getUnreadMessagesCount = async (userId: string) => {

    const unreadMessagesCount = await Message.countDocuments({
        receiverId: userId,
        read: false,
    });

    return unreadMessagesCount;
}

const sendNotificationNewConversation = async (receiver: string, conversationId: string) => {
    const receiverSocketId = getReceiverSocketId(receiver);

    const conversation = await Conversation.findById(conversationId)
        .select("_id lastMessage isGroup groupName members createdAt lastMessage")
        .populate("members", "name email profilePicture")
        .populate("lastMessage", "message read createdAt")

    if (receiverSocketId) {
        io.to(receiverSocketId).emit("newConversation", conversation?.toJSON());
        // console.log("1. EMITIENDO DESDE SERVICIO EL MENSAJE");
    }
}

const sendMessage = async (senderId: string, receiverId: string, body: SendNewMessageI) => {

    let isNew = false;

    const { message, messageType, image, replyTo } = body;

    const receiverObjectId = new mongoose.Types.ObjectId(receiverId); // <-- convertir

    // 1. Buscar o crear conversación
    let conversation = await Conversation.findOne({
        members: { $all: [senderId, receiverObjectId] },
    });

    if (!conversation) {
        conversation = await Conversation.create({
            members: [senderId, receiverObjectId],
        });
        isNew = true;
    }

    // 2. Crear mensaje vinculado a la conversación
    const newMessage = new Message({
        senderId,
        receiverId: receiverObjectId, // guardar como ObjectId
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
    console.log("-----------");

    console.log(populatedMessage);


    // 3. Actualizar última actividad de la conversación
    const newConversation = await Conversation.findByIdAndUpdate(conversation._id, {
        updatedAt: new Date(),
        lastMessage: newMessage._id
    },
        { new: true });

    if (isNew && newConversation?._id) {
        await sendNotificationNewConversation(receiverObjectId.toString(), newConversation._id.toString());
    }

    // 4. Emitir al receptor si está conectado
    const receiverSocketId = getReceiverSocketId(receiverObjectId.toString());
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", populatedMessage.toJSON());
        // console.log("1. EMITIENDO DESDE SERVICIO EL MENSAJE");
    }

    return populatedMessage;
}

const getMessagesPaginatedByChat = async (
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

    // Obtener el total de mensajes
    const total = await Message.countDocuments({
        conversationId: conversation._id
    });

    // Obtener mensajes paginados (más recientes primero)
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

    await markMessagesAsRead(currentUserId);

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



const getChatsByUserId = async (userId: string, page: number, limit: number) => {

    const skip = (page - 1) * limit;


    const total = await Conversation.countDocuments({
        members: { $all: [userId] },
    });

    const conversations = await Conversation.find({
        members: { $in: [userId] },
    })
        .select("_id lastMessage isGroup groupName members createdAt")
        .populate("members", "name email profilePicture") // obtenemos info básica de los miembros
        .populate("lastMessage", "message read createdAt _id")
        .sort({ updatedAt: -1 }) // opcional: ordenarlas por última actividad
        .skip(skip)
        .limit(limit);

    return {
        conversations: conversations,
        meta: {
            total: total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }
}


export default {
    sendMessage,
    getMessagesPaginatedByChat,
    getUnreadMessagesCount,
    getChatsByUserId
}