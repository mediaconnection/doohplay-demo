import { Server } from "socket.io"

let io: Server | null = null

export function getIO(server?: any) {

  if (!io && server) {
    io = new Server(server, {
      cors: {
        origin: "*"
      }
    })
  }

  return io
}