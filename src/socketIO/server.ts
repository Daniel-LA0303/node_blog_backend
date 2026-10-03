import dotenv from "dotenv";
dotenv.config();

import { Server, Socket } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/User";
import { Project } from "../models/Projects";
import { ProjectMember } from "../models/ProjectMember";

const app = express();

const server = http.createServer(app);

// create a new server only permit our frontend
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      process.env.FRONTEND_URL as string,
      process.env.FRONTEND_URL_WEB as string,
    ],
    methods: ["GET", "POST"],
  },
});

// object type
interface Users {
  [key: string]: string;
}

// users connected
const users: Users = {};

const admins: Users = {}

// get socket id by user id
export const getReceiverSocketId = (
  receiverId: string
): string | undefined => {
  return users[receiverId];
};

export const getAdminsSocketId = (
  receiverId: string
): string | undefined => {
  return admins[receiverId];
};


// socket connection
io.on("connection", async (socket: Socket) => {

  const userId = socket.handshake.query.userId as string;

  if (!userId) return;

  const roomOf = (projectId: string) => `project:${projectId}`
  socket.on('project:join', async (projectId: string, ack?: (r: { ok: boolean }) => void) => {
    console.log('join request:', projectId, 'user:', userId)
    try {
      const isOwner = await Project.exists({ _id: projectId, owner: userId })
      const isMember =
        isOwner ||
        (await ProjectMember.exists({ project: projectId, user: userId, status: 'ACTIVE' }))
      if (!isMember) return ack?.({ ok: false })

      socket.join(`project:${projectId}`)
      ack?.({ ok: true })
    } catch (err) {
      console.error('join error:', err)
      ack?.({ ok: false })
    }
  })

  socket.on('project:leave', (projectId: string) => {
    socket.leave(`project:${projectId}`)
  })

  // if user already connected, disconnect old socket
  if (users[userId]) {

    const oldSocketId = users[userId];

    const oldSocket = io.sockets.sockets.get(oldSocketId);

    if (oldSocket) {
      oldSocket.disconnect(true);
    }
  }

  // save new socket
  users[userId] = socket.id;

  // save if is moderator
  const userMod = await User.findById(userId);
  if (userMod?.roles?.some(role =>
    role.name === 'ROLE_MOD' || role.name === 'ROLE_ADMIN'
  )) {
    admins[userId] = socket.id; // list only mods
    socket.join('admins-room');
  }

  console.log(
    `User conected: ${userId}, socket.id: ${socket.id}`
  );

  // initial online users
  const initialOnlineUsers = Object.keys(users).filter(
    (id) => id !== userId
  );

  socket.emit(
    "initialOnlineUsers",
    initialOnlineUsers
  );

  // notify online
  socket.broadcast.emit("userOnline", {
    userId,
  });

  // disconnect
  socket.on("disconnect", () => {

    if (users[userId] === socket.id) {

      delete users[userId];

      socket.broadcast.emit("userOffline", {
        userId,
      });

      console.log(
        `User disconnect: ${userId}`
      );
    }
  });

});

export { app, io, server };