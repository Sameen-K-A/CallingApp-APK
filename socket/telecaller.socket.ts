import { API_CONFIG } from '@/config/api';
import { showErrorToast } from '@/utils/toast';
import { io, Socket } from 'socket.io-client';
import {
  CallIdPayload,
  TelecallerCallAcceptedPayload,
  TelecallerCallInformationPayload,
  TelecallerClientEvents,
  TelecallerServerEvents
} from './types';

type TelecallerSocket = Socket<TelecallerServerEvents, TelecallerClientEvents>;

let socket: TelecallerSocket | null = null;
let currentToken: string | null = null;
let connectionAttemptInProgress = false;
let onSocketReadyCallback: (() => void) | null = null;

// ============================================
// Connection Management
// ============================================
export const connectTelecallerSocket = (token: string): TelecallerSocket | null => {

  // Already connected with same token
  if (socket?.connected && currentToken === token) {
    onSocketReadyCallback?.();
    return socket;
  }

  // Connection attempt already in progress
  if (connectionAttemptInProgress) {
    return socket;
  }

  // Different token - disconnect old socket first
  if (socket && currentToken !== token) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  // Already have a socket (might be disconnected), try to reuse
  if (socket) {
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  connectionAttemptInProgress = true;
  currentToken = token;

  socket = io(`${API_CONFIG.SOCKET_URL}/telecaller`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  socket.on('connect', () => {
    connectionAttemptInProgress = false;
    console.log('📞 ✅ Telecaller socket connected:', socket?.id);
    onSocketReadyCallback?.();
  });

  socket.on('disconnect', (reason) => {
    console.log('📞 ❌ Telecaller socket disconnected:', reason);

    if (reason === 'io server disconnect') {
      currentToken = null;
    }
  });

  socket.on('connect_error', (error) => {
    connectionAttemptInProgress = false;
    console.log('📞 ⚠️ Telecaller socket connection error:', error.message);
  });

  socket.on('error', (data) => {
    showErrorToast(data.message);
  });

  return socket;
};

export const disconnectTelecallerSocket = (): void => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    currentToken = null;
    connectionAttemptInProgress = false;
    onSocketReadyCallback = null;
  }
};

export const getTelecallerSocket = (): TelecallerSocket | null => socket;

export const isTelecallerSocketConnected = (): boolean => socket?.connected ?? false;

export const getTelecallerSocketState = (): { connected: boolean; hasSocket: boolean; token: string | null } => ({
  connected: socket?.connected ?? false, hasSocket: socket !== null, token: currentToken,
});

export const setOnSocketReady = (callback: (() => void) | null): void => {
  onSocketReadyCallback = callback;
  if (socket?.connected && callback) {
    callback();
  }
};

// ============================================
// Event Helpers
// ============================================
const createEventSubscriber = <T>(eventName: keyof TelecallerServerEvents) => {
  return (callback: (data: T) => void): (() => void) => {
    if (!socket) {
      console.warn(`📞 ⚠️ Cannot subscribe to ${eventName}: socket is null`);
      return () => { };
    }

    socket.on(eventName, callback as any);

    return () => {
      socket?.off(eventName, callback as any);
    };
  };
};

const createEventEmitter = <T>(eventName: keyof TelecallerClientEvents) => {
  return (payload: T): boolean => {
    if (!socket?.connected) {
      console.warn(`📞 ⚠️ Cannot emit ${eventName}: socket not connected`);
      return false;
    }

    socket.emit(eventName, payload as any);
    return true;
  };
};

// Call Event Listeners
export const onCallIncoming = createEventSubscriber<TelecallerCallInformationPayload>('call:incoming');
export const onCallAccepted = createEventSubscriber<TelecallerCallAcceptedPayload>('call:accepted');
export const onCallMissed = createEventSubscriber<CallIdPayload>('call:missed');
export const onCallCancelled = createEventSubscriber<CallIdPayload>('call:cancelled');
export const onCallEnded = createEventSubscriber<CallIdPayload>('call:ended');

// Call Event Emitters
export const emitCallAccept = createEventEmitter<CallIdPayload>('call:accept');
export const emitCallReject = createEventEmitter<CallIdPayload>('call:reject');
export const emitCallEnd = createEventEmitter<CallIdPayload>('call:end');