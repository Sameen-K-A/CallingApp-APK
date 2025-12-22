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
let isManuallyDisconnected = false;

// Helper Functions
const createEventSubscriber = <T>(eventName: keyof UserServerEvents) => {
  return (callback: (data: T) => void): (() => void) => {
    if (!socket) {
      showErrorToast("Connection lost, Please restart the app");
      console.log(`👤 ⚠️ Cannot subscribe to ${eventName}: socket is null`);
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
      showErrorToast("Connection lost, Please restart the app");
      console.log(`👤 ⚠️ Cannot emit ${eventName}: socket not connected`);
      return false;
    }

    socket.emit(eventName, payload as any);
    return true;
  };
};

// Socket Connection Management
export const connectUserSocket = (token: string): UserSocket => {
  if (socket?.connected) {
    console.log('👤 User socket already connected');
    return socket;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
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
    showErrorToast(data.message);
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