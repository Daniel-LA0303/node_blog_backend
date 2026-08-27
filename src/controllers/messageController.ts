import { SendNewMessageI } from "../interfaces/message.interfaces.js";
import Message from "../models/Message.js";
import chatsServices from "../services/chatsServices.js";

// send message
export const sendMessageController = async (req: any, res: any) => {
  try {
    const body = req.body as SendNewMessageI;
    const { id: receiverId } = req.params;

    const senderId = req.user._id; // ObjectId

    const populatedMessage = await chatsServices.sendMessageService(senderId, receiverId, body);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.log("Error in sendMessage", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// get messages by chat
export const getMessagesController = async (req: any, res: any) => {
  try {
    const { id: otherUserId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    
    const currentUserId = req.user._id;

    const data = await chatsServices.getMessagesPaginatedByChatService(otherUserId, currentUserId, page, limit);

    res.status(200).json(data);
  } catch (error) {
    console.log("Error al obtener mensajes", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// get conversations by user
export const getConversationsController = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    
    const data = await chatsServices.getChatsByUserIdService(id, page, limit);

    res.status(200).json(data);
  } catch (error) {
    console.log("Error al obtener mensajes", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// get unread messages
export const getUnreadMessagesCountController = async (req: any, res: any) => {
  try {

    const userId = req.user._id; 
    
    // count
    const unreadMessagesCount = await chatsServices.getUnreadMessagesCountService(userId);

    res.status(200).json({ unreadMessagesCount });
  } catch (error) {
    console.log("Error al obtener los mensajes no leídos", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const markAsReadController = async (req: any, res: any) => {
  try {
    const currentUserId = req.user._id
    const { conversationId } = req.params
    
    await Message.updateMany(
      { conversationId, receiverId: currentUserId, read: false },
      { $set: { read: true } }
    )
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}


export const getMemoryUsage = (req: any, res: any) => {
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