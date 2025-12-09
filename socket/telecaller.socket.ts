import { API_CONFIG } from '@/config/api';
import { Alert } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { ClientEvents, ServerEvents } from './types';

type TelecallerSocket = Socket<ServerEvents, ClientEvents>;

let socket: TelecallerSocket | null = null;
let isManuallyDisconnected = false;

export const connectTelecallerSocket = (token: string): TelecallerSocket => {
  if (socket?.connected) {
    console.log('📞 Telecaller socket already connected');
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  isManuallyDisconnected = false;

  socket = io(`${API_CONFIG.SOCKET_URL}/telecaller`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('📞 ✅ Telecaller socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('📞 ❌ Telecaller socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.log('📞 ⚠️ Telecaller socket connection error:', error.message);
  });

  socket.on('error', (data) => {
    Alert.alert('Connection Error', data.message);
  });

  return socket;
};

export const disconnectTelecallerSocket = (): void => {
  if (socket) {
    isManuallyDisconnected = true;
    socket.disconnect();
    socket = null;
  }
};

export const getTelecallerSocket = (): TelecallerSocket | null => socket;

export const isTelecallerSocketConnected = (): boolean => socket?.connected ?? false;

export const isTelecallerSocketManuallyDisconnected = (): boolean => isManuallyDisconnected;