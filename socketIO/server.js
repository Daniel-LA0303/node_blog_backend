import dotenv from "dotenv"; 
dotenv.config();
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origin: "http://localhost:3001",
    origin: ["http://localhost:5173", process.env.FRONTEND_URL, process.env.FRONTEND_URL_WEB],
    methods: ["GET", "POST"],
  },
});

// realtime message code goes here
export const getReceiverSocketId = (receiverId) => {
  return users[receiverId];
};

const users = {};

// const users = {}; // { userId: socketId }

io.on("connection", (socket) => {
  
  const userId = socket.handshake.query.userId;
  if (!userId) return;

  // Si ya existe un socket para este usuario, lo cerramos
  if (users[userId]) {
    const oldSocketId = users[userId];
    const oldSocket = io.sockets.sockets.get(oldSocketId);
    if (oldSocket) {
      oldSocket.disconnect(true); // 🔴 forzar desconexión del anterior
    }
  }

  // Registrar usuario con el nuevo socket
  users[userId] = socket.id;

  console.log(`✅ Usuario conectado: ${userId}, socket.id: ${socket.id}`);

  // Enviar la lista inicial de usuarios conectados SOLO a este socket
  const initialOnlineUsers = Object.keys(users).filter((id) => id !== userId);
  socket.emit("initialOnlineUsers", initialOnlineUsers);

  // Notificar a los demás que este usuario está online
  socket.broadcast.emit("userOnline", { userId });

  // Manejar desconexión
  socket.on("disconnect", () => {
    if (users[userId] === socket.id) {
      delete users[userId];
      socket.broadcast.emit("userOffline", { userId });
      console.log(`❌ Usuario desconectado: ${userId}`);
    }
  });
});

export { app, io, server };