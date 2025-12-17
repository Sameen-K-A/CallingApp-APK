import { LiveKitCredentials } from '@/socket/types';
import { registerGlobals } from '@livekit/react-native';
import {
  ConnectionState,
  LocalParticipant,
  RemoteParticipant,
  Room,
  RoomEvent,
} from 'livekit-client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import InCallManager from 'react-native-incall-manager';

// Register LiveKit globals for React Native (WebRTC polyfills)
registerGlobals();

// ============================================
// Types
// ============================================
export type RoomConnectionState = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export interface UseLiveKitRoomReturn {
  // Connection State
  connectionState: RoomConnectionState;
  error: string | null;

  // Room & Participants
  room: Room | null;
  localParticipant: LocalParticipant | null;
  remoteParticipant: RemoteParticipant | null;

  // Audio Controls
  isMuted: boolean;
  toggleMute: () => Promise<void>;

  // Speaker Control
  isSpeakerOn: boolean;
  toggleSpeaker: () => void;

  // Connection Methods
  connect: (credentials: LiveKitCredentials) => Promise<void>;
  disconnect: () => Promise<void>;
}

// ============================================
// InCallManager Availability Check
// ============================================

const isInCallManagerAvailable = (): boolean => {
  try {
    return InCallManager && typeof InCallManager.start === 'function';
  } catch {
    return false;
  }
};

// ============================================
// Hook Implementation
// ============================================
export function useLiveKitRoom(): UseLiveKitRoomReturn {
  // Connection State
  const [connectionState, setConnectionState] = useState<RoomConnectionState>('IDLE');
  const [error, setError] = useState<string | null>(null);

  // Room Reference
  const roomRef = useRef<Room | null>(null);
  const [room, setRoom] = useState<Room | null>(null);

  // Participants
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
  const [remoteParticipant, setRemoteParticipant] = useState<RemoteParticipant | null>(null);

  // Media States
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false); // Default to earpiece (like phone call)

  // Refs to track InCallManager state
  const isInCallManagerStarted = useRef(false);
  const inCallManagerAvailable = useRef(isInCallManagerAvailable());

  // ============================================
  // InCallManager Helpers
  // ============================================

  const startInCallManager = useCallback(() => {
    if (isInCallManagerStarted.current) return;
    if (!inCallManagerAvailable.current) {
      console.log('📱 InCallManager not available, skipping...');
      return;
    }

    try {
      // Start InCallManager for audio call
      InCallManager.start({ media: 'audio' });

      // Default to earpiece (like a normal phone call)
      InCallManager.setSpeakerphoneOn(false);
      setIsSpeakerOn(false);

      // Enable proximity sensor (screen off when near ear) - Only on Android
      if (Platform.OS === 'android') {
        InCallManager.startProximitySensor();
      }

      isInCallManagerStarted.current = true;
      console.log('📱 InCallManager started (earpiece mode, proximity enabled)');
    } catch (err) {
      console.error('❌ Failed to start InCallManager:', err);
      // Don't throw - call can still work without InCallManager
      inCallManagerAvailable.current = false;
    }
  }, []);

  const stopInCallManager = useCallback(() => {
    if (!isInCallManagerStarted.current) return;
    if (!inCallManagerAvailable.current) return;

    try {
      // Stop proximity sensor - Only on Android
      if (Platform.OS === 'android') {
        InCallManager.stopProximitySensor();
      }

      // Stop InCallManager
      InCallManager.stop();

      isInCallManagerStarted.current = false;
      console.log('📱 InCallManager stopped');
    } catch (err) {
      console.error('❌ Failed to stop InCallManager:', err);
    }
  }, []);

  // ============================================
  // Room Event Handlers
  // ============================================
  const setupRoomEventListeners = useCallback((room: Room) => {
    // Connection State Changes
    room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
      console.log('🔌 LiveKit Connection State:', state);

      switch (state) {
        case ConnectionState.Connecting:
          setConnectionState('CONNECTING');
          break;
        case ConnectionState.Connected:
          setConnectionState('CONNECTED');
          setLocalParticipant(room.localParticipant);
          startInCallManager();
          break;
        case ConnectionState.Disconnected:
          setConnectionState('DISCONNECTED');
          break;
        case ConnectionState.Reconnecting:
          console.log('🔄 Reconnecting to LiveKit...');
          break;
      }
    });

    // Remote Participant Joined
    room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      console.log('👤 Remote Participant Connected:', participant.identity);
      setRemoteParticipant(participant);
    });

    // Remote Participant Left
    room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      console.log('👤 Remote Participant Disconnected:', participant.identity);
      setRemoteParticipant(null);
    });

    // Handle Disconnection
    room.on(RoomEvent.Disconnected, (reason) => {
      console.log('❌ Disconnected from room:', reason);
      setConnectionState('DISCONNECTED');
      stopInCallManager();
    });

  }, [startInCallManager, stopInCallManager]);

  // ============================================
  // Connect to Room
  // ============================================
  const connect = useCallback(async (credentials: LiveKitCredentials) => {
    try {
      setError(null);
      setConnectionState('CONNECTING');

      console.log('🚀 Connecting to LiveKit Room:', credentials.roomName);

      // Create new Room instance (Audio Only config)
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          deviceId: undefined, // No video needed
        },
      });

      roomRef.current = newRoom;
      setRoom(newRoom);

      // Setup event listeners
      setupRoomEventListeners(newRoom);

      // Connect to the room
      await newRoom.connect(credentials.url, credentials.token, {
        autoSubscribe: true,
      });

      console.log('✅ Connected to LiveKit Room:', credentials.roomName);

      // Enable microphone by default
      await newRoom.localParticipant.setMicrophoneEnabled(true);
      setIsMuted(false);

      // Check if there are already participants in the room
      const remoteParticipants = Array.from(newRoom.remoteParticipants.values());
      if (remoteParticipants.length > 0) {
        setRemoteParticipant(remoteParticipants[0]);
        console.log('👤 Found existing remote participant:', remoteParticipants[0].identity);
      }

    } catch (err: any) {
      console.error('❌ Failed to connect to LiveKit:', err);
      setError(err.message || 'Failed to connect to call');
      setConnectionState('ERROR');
      stopInCallManager();
    }
  }, [setupRoomEventListeners, stopInCallManager]);

  // ============================================
  // Disconnect from Room
  // ============================================
  const disconnect = useCallback(async () => {
    try {
      if (roomRef.current) {
        console.log('👋 Disconnecting from LiveKit Room...');
        await roomRef.current.disconnect();
        roomRef.current = null;
        setRoom(null);
        setLocalParticipant(null);
        setRemoteParticipant(null);
        setConnectionState('DISCONNECTED');
      }
      // Stop InCallManager
      stopInCallManager();
    } catch (err) {
      console.error('❌ Error disconnecting:', err);
      // Still try to stop InCallManager even if disconnect fails
      stopInCallManager();
    }
  }, [stopInCallManager]);

  // ============================================
  // Toggle Mute
  // ============================================
  const toggleMute = useCallback(async () => {
    if (!roomRef.current) return;

    try {
      const newMuteState = !isMuted;
      await roomRef.current.localParticipant.setMicrophoneEnabled(!newMuteState);
      setIsMuted(newMuteState);
      console.log('🎤 Microphone:', newMuteState ? 'Muted' : 'Unmuted');
    } catch (err) {
      console.error('❌ Error toggling mute:', err);
    }
  }, [isMuted]);

  // ============================================
  // Toggle Speaker
  // ============================================
  const toggleSpeaker = useCallback(() => {
    if (!inCallManagerAvailable.current) {
      console.log('📱 InCallManager not available, cannot toggle speaker');
      // Still update UI state for visual feedback
      setIsSpeakerOn(prev => !prev);
      return;
    }

    try {
      const newSpeakerState = !isSpeakerOn;
      InCallManager.setSpeakerphoneOn(newSpeakerState);
      setIsSpeakerOn(newSpeakerState);
      console.log('🔊 Speaker:', newSpeakerState ? 'On (Speaker)' : 'Off (Earpiece)');
    } catch (err) {
      console.error('❌ Error toggling speaker:', err);
      // Still update UI state for visual feedback
      setIsSpeakerOn(prev => !prev);
    }
  }, [isSpeakerOn]);

  // ============================================
  // Cleanup on Unmount
  // ============================================
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      stopInCallManager();
    };
  }, [stopInCallManager]);

  // ============================================
  // Return Hook Values
  // ============================================
  return {
    connectionState,
    error,
    room,
    localParticipant,
    remoteParticipant,
    isMuted,
    toggleMute,
    isSpeakerOn,
    toggleSpeaker,
    connect,
    disconnect,
  };
}