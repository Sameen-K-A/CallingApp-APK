import { API_CONFIG } from '@/config/api';
import { showToast } from '@/utils/toast';
import { io, Socket } from 'socket.io-client';
import {
  CallAcceptedPayload,
  CallErrorPayload,
  CallInitiatePayload,
  CallRejectedPayload,
  CallRingingPayload,
  TelecallerPresencePayload,
  UserClientEvents,
  UserServerEvents,
} from './types';

type UserSocket = Socket<UserServerEvents, UserClientEvents>;

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
    showToast(data.message)
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


// Telecaller Presence Change Listener
export const onTelecallerPresenceChanged = (callback: (data: TelecallerPresencePayload) => void): (() => void) => {
  if (!socket) {
    console.log('👤 ⚠️ Cannot subscribe to presence changes: socket not connected');
    return () => { };
  }

  socket.on('telecaller:presence-changed', callback);

  // Return cleanup function
  return () => {
    socket?.off('telecaller:presence-changed', callback);
  };
};

// Call Event Emitters
export const emitCallInitiate = (payload: CallInitiatePayload): boolean => {
  if (!socket?.connected) {
    console.log('👤 ⚠️ Cannot initiate call: socket not connected');
    return false;
  }

  socket.emit('call:initiate', payload);
  return true;
};

// Call Event Listeners
export const onCallRinging = (callback: (data: CallRingingPayload) => void): (() => void) => {
  if (!socket) {
    console.log('👤 ⚠️ Cannot subscribe to call:ringing: socket not connected');
    return () => { };
  }

  socket.on('call:ringing', callback);

  return () => {
    socket?.off('call:ringing', callback);
  };
};

export const onCallError = (callback: (data: CallErrorPayload) => void): (() => void) => {
  if (!socket) {
    console.log('👤 ⚠️ Cannot subscribe to call:error: socket not connected');
    return () => { };
  }

  socket.on('call:error', callback);

  return () => {
    socket?.off('call:error', callback);
  };
};

export const onCallAccepted = (callback: (data: CallAcceptedPayload) => void): (() => void) => {
  if (!socket) {
    console.log('👤 ⚠️ Cannot subscribe to call:accepted: socket not connected');
    return () => { };
  }

  socket.on('call:accepted', callback);

  return () => {
    socket?.off('call:accepted', callback);
  };
};

export const onCallRejected = (callback: (data: CallRejectedPayload) => void): (() => void) => {
  if (!socket) {
    console.log('👤 ⚠️ Cannot subscribe to call:rejected: socket not connected');
    return () => { };
  }

  socket.on('call:rejected', callback);

  return () => {
    socket?.off('call:rejected', callback);
  };
};