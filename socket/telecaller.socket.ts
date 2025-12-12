import { API_CONFIG } from '@/config/api';
import { showErrorToast } from '@/utils/toast';
import { io, Socket } from 'socket.io-client';
import {
  CallAcceptPayload,
  CallCancelledPayload,
  CallEndedPayload,
  CallEndPayload,
  CallIncomingPayload,
  CallMissedPayload,
  CallRejectPayload,
  TelecallerCallAcceptedPayload,
  TelecallerClientEvents,
  TelecallerServerEvents
} from './types';

type TelecallerSocket = Socket<TelecallerServerEvents, TelecallerClientEvents>;

let socket: TelecallerSocket | null = null;
let isManuallyDisconnected = false;
let onSocketReadyCallback: (() => void) | null = null;

// Helper Functions
const createEventSubscriber = <T>(eventName: keyof TelecallerServerEvents) => {
  return (callback: (data: T) => void): (() => void) => {
    if (!socket) {
      showErrorToast("Connection lost, Please restart the app");
      console.log(`📞 ⚠️ Cannot subscribe to ${eventName}: socket is null`);
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
      showErrorToast("Connection lost, Please restart the app");
      console.log(`📞 ⚠️ Cannot emit ${eventName}: socket not connected`);
      return false;
    }

    socket.emit(eventName, payload as any);
    return true;
  };
};

// Socket Connection Management
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
    onSocketReadyCallback?.();
  });

  socket.on('disconnect', (reason) => {
    console.log('📞 ❌ Telecaller socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.log('📞 ⚠️ Telecaller socket connection error:', error.message);
  });

  socket.on('error', (data) => {
    showErrorToast(data.message);
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

// Call Event Listeners
export const onCallIncoming = createEventSubscriber<CallIncomingPayload>('call:incoming');
export const onCallAccepted = createEventSubscriber<TelecallerCallAcceptedPayload>('call:accepted');
export const onCallMissed = createEventSubscriber<CallMissedPayload>('call:missed');
export const onCallCancelled = createEventSubscriber<CallCancelledPayload>('call:cancelled');
export const onCallEnded = createEventSubscriber<CallEndedPayload>('call:ended');

// Call Event Emitters
export const emitCallAccept = createEventEmitter<CallAcceptPayload>('call:accept');
export const emitCallReject = createEventEmitter<CallRejectPayload>('call:reject');
export const emitCallEnd = createEventEmitter<CallEndPayload>('call:end');