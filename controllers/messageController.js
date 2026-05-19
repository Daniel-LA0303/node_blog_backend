import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import { getReceiverSocketId, io } from "../socketIO/server.js";
import Message from "../models/Message.js";

const markMessagesAsRead = async (userId) => {
  return await Message.updateMany(
    { receiverId: userId, read: false },
    { $set: { read: true } }
  );
};

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;

    const senderId = req.user._id; // ObjectId
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId); // <-- convertir

    // 1. Buscar o crear conversación
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverObjectId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        members: [senderId, receiverObjectId],
      });
    }

    // 2. Crear mensaje vinculado a la conversación
    const newMessage = new Message({
      senderId,
      receiverId: receiverObjectId, // guardar como ObjectId
      message,
      conversationId: conversation._id,
      read: false,
    });

    await newMessage.save();

    const populatedMessage = await newMessage.populate("senderId", "name email profilePicture");

    // 3. Actualizar última actividad de la conversación
    await Conversation.findByIdAndUpdate(conversation._id, {
      updatedAt: new Date(),
    });

    // 4. Emitir al receptor si está conectado
    const receiverSocketId = getReceiverSocketId(receiverObjectId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", populatedMessage.toJSON());
      // console.log("1. EMITIENDO DESDE SERVICIO EL MENSAJE");
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.log("Error in sendMessage", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// routes/message.js
export const getMessages = async (req, res) => {
  try {
    const { id: otherUserId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const currentUserId = req.user._id;
    const otherUserObjectId = new mongoose.Types.ObjectId(otherUserId);

    const conversation = await Conversation.findOne({
      members: { $all: [currentUserId, otherUserObjectId] },
    });

    if (!conversation) {
      return res.status(200).json({
        messages: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0
        }
      });
    }

    // Obtener el total de mensajes
    const total = await Message.countDocuments({ 
      conversationId: conversation._id 
    });

    // Obtener mensajes paginados (más recientes primero)
    const messages = await Message.find({ conversationId: conversation._id })
      .populate("senderId", "name email profilePicture")
      .sort({ createdAt: -1 }) // Orden descendente para obtener los más recientes primero
      .skip(skip)
      .limit(limit);

    await markMessagesAsRead(currentUserId);

    res.status(200).json({
      messages: messages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.log("Error al obtener mensajes", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


export const getUnreadMessagesCount = async (req, res) => {
  try {

    // obtendremos el id psandolo desde el backend ya no desde sesion
    const userId = req.user._id; // El id del usuario que se reconecta
    
    // Contar los mensajes no leídos para este usuario
    const unreadMessagesCount = await Message.countDocuments({
      receiverId: userId,
      read: false,
    });

    res.status(200).json({ unreadMessagesCount }); // Enviar el número de mensajes no leídos
  } catch (error) {
    console.log("Error al obtener los mensajes no leídos", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


export const getMemoryUsage = (req, res) => {
  try {
    const usage = process.memoryUsage();

    // Convertimos de bytes a MB
    const memoryInfo = {
      ramUsedMB: (usage.heapUsed / 1024 / 1024).toFixed(2),       // Memoria usada por Node.js
      ramTotalHeapMB: (usage.heapTotal / 1024 / 1024).toFixed(2), // Total de heap asignado
      rssMB: (usage.rss / 1024 / 1024).toFixed(2),               // Memoria residente total
      externalMB: (usage.external / 1024 / 1024).toFixed(2),     // Memoria C++ externa
    };

    res.status(200).json({ memoryInfo });
  } catch (error) {
    console.error("Error al obtener uso de memoria:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};