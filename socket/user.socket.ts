import { API_CONFIG } from '@/config/api';
import { Alert } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { ClientEvents, ServerEvents } from './types';

type UserSocket = Socket<ServerEvents, ClientEvents>;

let socket: UserSocket | null = null;
let isManuallyDisconnected = false;

export const connectUserSocket = (token: string): UserSocket => {
  if (socket?.connected) {
    console.log('👤 User socket already connected');
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  isManuallyDisconnected = false;

  socket = io(`${API_CONFIG.SOCKET_URL}/user`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('👤 ✅ User socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('👤 ❌ User socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.log('👤 ⚠️ User socket connection error:', error.message);
  });

  socket.on('error', (data) => {
    Alert.alert('Connection Error', data.message);
  });

  return socket;
};

export const disconnectUserSocket = (): void => {
  if (socket) {
    isManuallyDisconnected = true;
    socket.disconnect();
    socket = null;
  }
};

export const getUserSocket = (): UserSocket | null => socket;

export const isUserSocketConnected = (): boolean => socket?.connected ?? false;

export const isUserSocketManuallyDisconnected = (): boolean => isManuallyDisconnected;