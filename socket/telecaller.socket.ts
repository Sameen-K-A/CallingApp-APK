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
let isManuallyDisconnected = false;
let onSocketReadyCallback: (() => void) | null = null;

// Pending Call Data Storage
// This solves the race condition where call:accepted arrives
// before the audio-call screen subscribes to the event.
// We store pending data here and the screen checks on mount.
const pendingCallAcceptedMap = new Map<string, TelecallerCallAcceptedPayload>();

// Store pending call accepted data by callId Called when call:accepted event arrives
export const setPendingCallAccepted = (data: TelecallerCallAcceptedPayload): void => {
  console.log(`📞 Storing pending call:accepted for callId: ${data.callId}`);
  pendingCallAcceptedMap.set(data.callId, data);
};

export const getPendingCallAccepted = (callId: string): TelecallerCallAcceptedPayload | null => {
  return pendingCallAcceptedMap.get(callId) || null;
};

export const clearPendingCallAccepted = (callId: string): void => {
  console.log(`📞 Clearing pending call:accepted for callId: ${callId}`);
  pendingCallAcceptedMap.delete(callId);
};

export const clearAllPendingCallData = (): void => {
  console.log(`📞 Clearing all pending call data`);
  pendingCallAcceptedMap.clear();
};

// ============================================
// Helper Functions
// ============================================
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

// ============================================
// Socket Connection Management
// ============================================
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
    clearAllPendingCallData();
  });

  socket.on('connect_error', (error) => {
    console.log('📞 ⚠️ Telecaller socket connection error:', error.message);
  });

  socket.on('error', (data) => {
    showErrorToast(data.message);
  });

  // ============================================
  // Auto-subscribe to call:accepted
  // ============================================
  socket.on('call:accepted', (data: TelecallerCallAcceptedPayload) => {
    console.log('📞 Received call:accepted in socket manager, storing for callId:', data.callId);
    setPendingCallAccepted(data);
  });

  return socket;
};

export const disconnectTelecallerSocket = (): void => {
  if (socket) {
    isManuallyDisconnected = true;
    clearAllPendingCallData();
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
export const onCallIncoming = createEventSubscriber<TelecallerCallInformationPayload>('call:incoming');
export const onCallAccepted = createEventSubscriber<TelecallerCallAcceptedPayload>('call:accepted');
export const onCallMissed = createEventSubscriber<CallIdPayload>('call:missed');
export const onCallCancelled = createEventSubscriber<CallIdPayload>('call:cancelled');
export const onCallEnded = createEventSubscriber<CallIdPayload>('call:ended');

// ============================================
// Call Event Emitters
// ============================================
export const emitCallAccept = createEventEmitter<CallIdPayload>('call:accept');
export const emitCallReject = createEventEmitter<CallIdPayload>('call:reject');
export const emitCallEnd = createEventEmitter<CallIdPayload>('call:end');