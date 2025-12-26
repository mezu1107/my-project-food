// src/lib/socket.ts
import { io, Socket, ManagerOptions, SocketOptions } from "socket.io-client";

/**
 * Socket base URL
 */
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

let socket: Socket | null = null;

/**
 * Initialize or return existing Socket.IO connection
 */
export const initSocket = (): Socket | null => {
  if (socket?.connected) return socket;
  if (socket) return socket;

  const token = localStorage.getItem("authToken");

  const options: Partial<ManagerOptions & SocketOptions> = {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true,
    withCredentials: true,
    ...(token ? { auth: { token } } : {}),
  };

  socket = io(SOCKET_URL, options);

  socket.on("connect", () => {
    console.log("✅ Socket.IO connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.warn("⚠️ Socket.IO disconnected:", reason);
    if (reason === "io server disconnect") {
      socket?.connect();
    }
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket.IO connection error:", error.message);
  });

  socket.on("auth_error", (msg: string) => {
    console.error("🚫 Socket authentication failed:", msg);
    disconnectSocket();
  });

  return socket;
};

/**
 * Get current socket instance
 */
export const getSocket = (): Socket | null => {
  if (!socket) initSocket();
  return socket;
};

/**
 * Export the raw socket for use in context/hooks
 */
export { socket };

/**
 * Disconnect and cleanup
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket.IO manually disconnected");
  }
};

/**
 * Join/leave rooms
 */
export const joinRoom = (room: string): void => {
  const s = getSocket();
  if (s?.connected) {
    s.emit("join", room);
    console.log(`🏠 Joined room: ${room}`);
  }
};

export const leaveRoom = (room: string): void => {
  const s = getSocket();
  if (s?.connected) {
    s.emit("leave", room);
    console.log(`🚪 Left room: ${room}`);
  }
};

/**
 * Reconnect with new token (after login/logout)
 */
export const reconnectWithNewToken = (): void => {
  disconnectSocket();
  initSocket();
};