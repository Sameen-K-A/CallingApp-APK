import { API_CONFIG } from '@/config/api';
import { showToast } from '@/utils/toast';
import { io, Socket } from 'socket.io-client';
import {
  CallAcceptPayload,
  CallIncomingPayload,
  CallRejectPayload,
  TelecallerCallAcceptedPayload,
  TelecallerClientEvents,
  TelecallerServerEvents
} from './types';

type TelecallerSocket = Socket<TelecallerServerEvents, TelecallerClientEvents>;

let socket: TelecallerSocket | null = null;
let isManuallyDisconnected = false;
let onSocketReadyCallback: (() => void) | null = null;

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
    if (onSocketReadyCallback) {
      onSocketReadyCallback();
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('📞 ❌ Telecaller socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.log('📞 ⚠️ Telecaller socket connection error:', error.message);
  });

  socket.on('error', (data) => {
    showToast(data.message)
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

export const setOnSocketReady = (callback: (() => void) | null): void => {
  onSocketReadyCallback = callback;
  if (socket?.connected && callback) {
    callback();
  }
};


// ============================================
// Call Event Listeners
// ============================================

export const onCallIncoming = (callback: (data: CallIncomingPayload) => void): (() => void) => {
  if (!socket) {
    console.log('📞 ⚠️ Cannot subscribe to call:incoming: socket is null');
    return () => { };
  }

  socket.on('call:incoming', callback);

  return () => {
    socket?.off('call:incoming', callback);
  };
};

export const onCallAccepted = (callback: (data: TelecallerCallAcceptedPayload) => void): (() => void) => {
  if (!socket) {
    console.log('📞 ⚠️ Cannot subscribe to call:accepted: socket is null');
    return () => { };
  }

  socket.on('call:accepted', callback);

  return () => {
    socket?.off('call:accepted', callback);
  };
};



// ============================================
// Call Event Emitters
// ============================================

export const emitCallAccept = (payload: CallAcceptPayload): boolean => {
  if (!socket?.connected) {
    console.log('📞 ⚠️ Cannot accept call: socket not connected');
    return false;
  }

  socket.emit('call:accept', payload);
  return true;
};

export const emitCallReject = (payload: CallRejectPayload): boolean => {
  if (!socket?.connected) {
    console.log('📞 ⚠️ Cannot reject call: socket not connected');
    return false;
  }

  socket.emit('call:reject', payload);
  return true;
};