// src/lib/socket.ts
import { io, Socket, ManagerOptions, SocketOptions } from "socket.io-client";
import { useAuthStore } from "@/features/auth/store/authStore";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

console.log("🌐 Socket.IO URL:", SOCKET_URL);

let socket: Socket | null = null;

export const initSocket = (): Socket | null => {
  if (socket?.connected) return socket;
  if (socket) return socket;

  const token = localStorage.getItem("authToken");

  const options: Partial<ManagerOptions & SocketOptions> = {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
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

    const { user } = useAuthStore.getState();
    if (user?.role === "admin" || user?.role === "kitchen") {
      socket?.emit("join", "admin");
      socket?.emit("join", "kitchen");
      console.log("🏠 Auto-joined admin & kitchen rooms");
    }
  });

  socket.on("disconnect", (reason) => {
    console.warn("⚠️ Socket.IO disconnected:", reason);
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

export const getSocket = (): Socket | null => {
  if (!socket) initSocket();
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket.IO manually disconnected");
  }
};

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

export const reconnectWithNewToken = (): void => {
  disconnectSocket();
  initSocket();
};