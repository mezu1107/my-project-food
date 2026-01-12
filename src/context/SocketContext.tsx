// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket, joinRoom } from '@/lib/socket'; // ← Only import helpers
import { useAuthStore } from '@/features/auth/store/authStore';

interface SocketContextType {
  socket: ReturnType<typeof getSocket>; // Use function return type
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const currentSocket = getSocket(); // Safe access

    if (!isAuthenticated || !user?.id) {
      currentSocket?.disconnect();
      setIsConnected(false);
      return;
    }

    // Ensure connected
    if (!currentSocket?.connected) {
      currentSocket?.connect();
    }

    setIsConnected(currentSocket?.connected ?? false);

    // Join user room
    joinRoom(`user:${user.id}`);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    currentSocket?.on('connect', handleConnect);
    currentSocket?.on('disconnect', handleDisconnect);

    return () => {
      currentSocket?.off('connect', handleConnect);
      currentSocket?.off('disconnect', handleDisconnect);
    };
  }, [isAuthenticated, user?.id]);

  const socket = getSocket(); // Provide current socket

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};