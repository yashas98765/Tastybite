import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // When deployed (e.g. on Vercel), connect to the Render backend URL
    // In local dev, Vite proxies /socket.io to localhost:5000
    const socketEndpoint = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : undefined;

    const newSocket = io(socketEndpoint, {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[TastyBite Socket] Connected to realtime gateway');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinOrderRoom = (orderId) => {
    if (socket && orderId) {
      socket.emit('join_order_room', orderId);
    }
  };

  const joinGroupRoom = (groupCode) => {
    if (socket && groupCode) {
      socket.emit('join_group_room', groupCode);
    }
  };

  const joinChatRoom = (chatId) => {
    if (socket && chatId) {
      socket.emit('join_chat_room', chatId);
    }
  };

  const joinAdminRoom = () => {
    if (socket) {
      socket.emit('join_admin_room');
    }
  };

  const value = {
    socket,
    joinOrderRoom,
    joinGroupRoom,
    joinChatRoom,
    joinAdminRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
