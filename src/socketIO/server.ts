import { Server, Socket } from "socket.io";
import http from "http";
import express from "express";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import User from "../models/User";
import { Project } from "../models/Projects";
import { ProjectMember } from "../models/ProjectMember";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  transports: ["websocket"],
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      process.env.FRONTEND_URL as string,
      process.env.FRONTEND_URL_WEB as string,
    ].filter(Boolean),
    methods: ["GET", "POST"],
  },
});

/* ---------- Redis: solo en production ---------- */
export const initRedis = async () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("[socket] development: sin Redis (un solo proceso)");
    return;
  }

  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL es obligatorio cuando NODE_ENV=production");
  }

  const pub = createClient({ url });
  const sub = pub.duplicate();

  pub.on("error", (err: any) => console.error("[redis pub] error:", err.message));
  sub.on("error", (err: any) => console.error("[redis sub] error:", err.message));

  await Promise.all([pub.connect(), sub.connect()]);

  io.adapter(createAdapter(pub, sub));
  console.log("[socket] production: Redis adapter activo");
};

/* ---------- Compatibilidad con tus controladores ---------- */
export const getReceiverSocketId = (receiverId: string): string | undefined =>
  receiverId ? `user:${receiverId}` : undefined;

export const getAdminsSocketId = (receiverId: string): string | undefined =>
  receiverId ? `user:${receiverId}` : undefined;

const userRoom = (userId: string) => `user:${userId}`;
const projectRoom = (projectId: string) => `project:${projectId}`;

/* ---------- Conexión ---------- */
io.on("connection", async (socket: Socket) => {
  const userId = socket.handshake.query.userId as string;

  if (!userId) {
    socket.disconnect(true);
    return;
  }

  // listeners primero, para no perder eventos durante los await
  socket.on(
    "project:join",
    async (projectId: string, ack?: (r: { ok: boolean }) => void) => {
      try {
        const isOwner = await Project.exists({ _id: projectId, owner: userId });
        const isMember =
          isOwner ||
          (await ProjectMember.exists({
            project: projectId,
            user: userId,
            status: "ACTIVE",
          }));
        if (!isMember) return ack?.({ ok: false });

        socket.join(projectRoom(projectId));
        ack?.({ ok: true });
      } catch (err) {
        console.error("join error:", err);
        ack?.({ ok: false });
      }
    }
  );

  socket.on("project:leave", (projectId: string) => {
    socket.leave(projectRoom(projectId));
  });

  socket.on("disconnect", async (reason) => {
    try {
      const remaining = await io.in(userRoom(userId)).fetchSockets();
      if (remaining.length === 0) {
        socket.broadcast.emit("userOffline", { userId });
        console.log(
          `User disconnect: ${userId}, socket.id: ${socket.id}, reason: ${reason}`
        );
      }
    } catch (err) {
      console.error("disconnect error:", err);
    }
  });

  try {
    // cierra SOLO las sesiones anteriores del mismo usuario (en cualquier pod),
    // excluyendo el socket actual para que no se desconecte a sí mismo
    io.in(userRoom(userId)).except(socket.id).disconnectSockets(true);
    socket.join(userRoom(userId));

    const userMod = await User.findById(userId);
    if (
      userMod?.roles?.some(
        (role) => role.name === "ROLE_MOD" || role.name === "ROLE_ADMIN"
      )
    ) {
      socket.join("admins-room");
    }

    console.log(`User conected: ${userId}, socket.id: ${socket.id}`);

    const sockets = await io.fetchSockets();
    const initialOnlineUsers = [
      ...new Set(sockets.map((s) => s.handshake.query.userId as string)),
    ].filter((id) => id && id !== userId);

    socket.emit("initialOnlineUsers", initialOnlineUsers);
    socket.broadcast.emit("userOnline", { userId });
  } catch (err) {
    console.error("connection error:", err);
  }
});

export { app, io, server };