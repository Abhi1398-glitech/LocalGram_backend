import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "./config";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // Connect to the Express/Socket.IO server dynamically
    socket = io(BACKEND_URL, {
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
