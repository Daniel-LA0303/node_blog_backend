// sockets/projectEmitter.ts
import { Request } from 'express'
import { io } from './server'


export const emitToProject = (req: Request, projectId: string, event: string, payload: unknown) => {
  const senderSocketId = req.headers['x-socket-id'] as string | undefined
  let op = io.to(`project:${projectId}`)
  if (senderSocketId) op = op.except(senderSocketId)
  op.emit(event, payload)
}

// sockets/projectEmitter.ts
export const emitToProjectRoom = (projectId: string, event: string, payload: unknown) => {
  io.to(`project:${projectId}`).emit(event, payload)
}