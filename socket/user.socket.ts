import { API_CONFIG } from '@/config/api';
import { showErrorToast } from '@/utils/toast';
import { io, Socket } from 'socket.io-client';
import {
  CallAcceptedPayload,
  CallIdPayload,
  CallInitiatePayload,
  CallRingingPayload,
  MessagePayload,
  TelecallerPresencePayload,
  UserClientEvents,
  UserServerEvents
} from './types';

type UserSocket = Socket<UserServerEvents, UserClientEvents>;

let socket: UserSocket | null = null;
let currentToken: string | null = null;
let connectionAttemptInProgress = false;

// ============================================
// Connection Management
// ============================================
export const connectUserSocket = (token: string): UserSocket | null => {

  // Already connected with same token
  if (socket?.connected && currentToken === token) {
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


  socket = io(`${API_CONFIG.SOCKET_URL}/user`, {
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
    console.log('👤 ✅ User socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('👤 ❌ User socket disconnected:', reason);

    // If server disconnected us, don't auto-reconnect
    if (reason === 'io server disconnect') {
      currentToken = null;
    }
  });

  socket.on('connect_error', (error) => {
    connectionAttemptInProgress = false;
    console.log('👤 ⚠️ User socket connection error:', error.message);
  });

  socket.on('error', (data) => {
    showErrorToast(data.message);
  });

  return socket;
};

export const disconnectUserSocket = (): void => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    currentToken = null;
    connectionAttemptInProgress = false;
  }
};

export const getUserSocket = (): UserSocket | null => socket;

export const isUserSocketConnected = (): boolean => socket?.connected ?? false;

export const getUserSocketState = (): { connected: boolean; hasSocket: boolean; token: string | null } => (
  { connected: socket?.connected ?? false, hasSocket: socket !== null, token: currentToken, }
);

// ============================================
// Event Helpers
// ============================================
const createEventSubscriber = <T>(eventName: keyof UserServerEvents) => {
  return (callback: (data: T) => void): (() => void) => {
    if (!socket) {
      console.warn(`👤 ⚠️ Cannot subscribe to ${eventName}: socket is null`);
      return () => { };
    }

    socket.on(eventName, callback as any);

    return () => {
      socket?.off(eventName, callback as any);
    };
  };
};

const createEventEmitter = <T>(eventName: keyof UserClientEvents) => {
  return (payload: T): boolean => {
    if (!socket?.connected) {
      console.warn(`👤 ⚠️ Cannot emit ${eventName}: socket not connected`);
      return false;
    }

    socket.emit(eventName, payload as any);
    return true;
  };
};

// Call Event Listeners
export const onTelecallerPresenceChanged = createEventSubscriber<TelecallerPresencePayload>('telecaller:presence-changed');
export const onCallRinging = createEventSubscriber<CallRingingPayload>('call:ringing');
export const onCallError = createEventSubscriber<MessagePayload>('call:error');
export const onCallAccepted = createEventSubscriber<CallAcceptedPayload>('call:accepted');
export const onCallRejected = createEventSubscriber<CallIdPayload>('call:rejected');
export const onCallMissed = createEventSubscriber<CallIdPayload>('call:missed');
export const onCallEnded = createEventSubscriber<CallIdPayload>('call:ended');

// Call Event Emitters
export const emitCallInitiate = createEventEmitter<CallInitiatePayload>('call:initiate');
export const emitCallCancel = createEventEmitter<CallIdPayload>('call:cancel');
export const emitCallEnd = createEventEmitter<CallIdPayload>('call:end');