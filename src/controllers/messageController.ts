import Message from "../models/Message.js";
import chatsServices from "../services/chatsServices.js";

export const sendMessage = async (req: any, res: any) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;

    const senderId = req.user._id; // ObjectId

    const populatedMessage = await chatsServices.sendMessage(senderId, receiverId, message);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.log("Error in sendMessage", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// routes/message.js
export const getMessages = async (req: any, res: any) => {
  try {
    const { id: otherUserId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    
    const currentUserId = req.user._id;

    const data = await chatsServices.getMessagesPaginatedByChat(otherUserId, currentUserId, page, limit);

    res.status(200).json(data);
  } catch (error) {
    console.log("Error al obtener mensajes", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getConversations = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    
    const currentUserId = req.user._id;

    const data = await chatsServices.getChatsByUserId(id, page, limit);

    res.status(200).json(data);
  } catch (error) {
    console.log("Error al obtener mensajes", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


export const getUnreadMessagesCount = async (req: any, res: any) => {
  try {

    // obtendremos el id psandolo desde el backend ya no desde sesion
    const userId = req.user._id; // El id del usuario que se reconecta
    
    // Contar los mensajes no leídos para este usuario
    const unreadMessagesCount = await chatsServices.getUnreadMessagesCount(userId);

    res.status(200).json({ unreadMessagesCount }); // Enviar el número de mensajes no leídos
  } catch (error) {
    console.log("Error al obtener los mensajes no leídos", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const markAsRead = async (req: any, res: any) => {
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