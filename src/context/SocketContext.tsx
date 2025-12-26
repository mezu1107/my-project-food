// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { socket, joinRoom, getSocket } from '@/lib/socket';
import { useAuthStore } from '@/features/auth/store/authStore';

interface SocketContextType {
  socket: typeof socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(socket?.connected ?? false);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      // Not logged in → disconnect
      socket?.disconnect();
      setIsConnected(false);
      return;
    }

    // Connect and join personal room
    const currentSocket = getSocket();
    if (currentSocket) {
      setIsConnected(currentSocket.connected);

      // Join user-specific room
      joinRoom(`user:${user.id}`);

      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);

      currentSocket.on('connect', handleConnect);
      currentSocket.on('disconnect', handleDisconnect);

      return () => {
        currentSocket.off('connect', handleConnect);
        currentSocket.off('disconnect', handleDisconnect);
        currentSocket.disconnect();
      };
    }
  }, [isAuthenticated, user?.id]);

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