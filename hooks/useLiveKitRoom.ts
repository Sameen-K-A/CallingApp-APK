import { LiveKitCredentials } from '@/socket/types';
import { registerGlobals } from '@livekit/react-native';
import {
  ConnectionState,
  LocalParticipant,
  LocalVideoTrack,
  RemoteParticipant,
  RemoteVideoTrack,
  Room,
  RoomEvent,
  Track,
  VideoPresets,
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
export type CallType = 'AUDIO' | 'VIDEO';

export interface UseLiveKitRoomOptions {
  callType: CallType;
}

export interface UseLiveKitRoomReturn {
  // Connection State
  connectionState: RoomConnectionState;
  error: string | null;

  // Room & Participants
  room: Room | null;
  localParticipant: LocalParticipant | null;
  remoteParticipant: RemoteParticipant | null;

  // Video Tracks
  localVideoTrack: LocalVideoTrack | null;
  remoteVideoTrack: RemoteVideoTrack | null;

  // Audio Controls
  isMuted: boolean;
  toggleMute: () => Promise<void>;

  // Speaker Control
  isSpeakerOn: boolean;
  toggleSpeaker: () => void;

  // Camera Control (Video only)
  isCameraOff: boolean;
  toggleCamera: () => Promise<void>;

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
export function useLiveKitRoom(options: UseLiveKitRoomOptions): UseLiveKitRoomReturn {
  const { callType } = options;
  const isVideoCall = callType === 'VIDEO';

  // Connection State
  const [connectionState, setConnectionState] = useState<RoomConnectionState>('IDLE');
  const [error, setError] = useState<string | null>(null);

  // Room Reference
  const roomRef = useRef<Room | null>(null);
  const [room, setRoom] = useState<Room | null>(null);

  // Participants
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
  const [remoteParticipant, setRemoteParticipant] = useState<RemoteParticipant | null>(null);

  // Video Tracks
  const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState<RemoteVideoTrack | null>(null);

  // Media States
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(isVideoCall); // Speaker ON for video, OFF for audio
  const [isCameraOff, setIsCameraOff] = useState(false);

  // Refs
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
      InCallManager.start({ media: isVideoCall ? 'video' : 'audio' });

      // Video calls: Speaker ON, no proximity sensor
      // Audio calls: Earpiece (speaker OFF), proximity sensor ON
      if (isVideoCall) {
        InCallManager.setSpeakerphoneOn(true);
        setIsSpeakerOn(true);
      } else {
        InCallManager.setSpeakerphoneOn(false);
        setIsSpeakerOn(false);
        if (Platform.OS === 'android') {
          InCallManager.startProximitySensor();
        }
      }

      isInCallManagerStarted.current = true;
      console.log(`📱 InCallManager started (${isVideoCall ? 'video mode, speaker' : 'audio mode, earpiece'})`);
    } catch (err) {
      console.error('❌ Failed to start InCallManager:', err);
      inCallManagerAvailable.current = false;
    }
  }, [isVideoCall]);

  const stopInCallManager = useCallback(() => {
    if (!isInCallManagerStarted.current) return;
    if (!inCallManagerAvailable.current) return;

    try {
      if (!isVideoCall && Platform.OS === 'android') {
        InCallManager.stopProximitySensor();
      }

      InCallManager.stop();
      isInCallManagerStarted.current = false;
      console.log('📱 InCallManager stopped');
    } catch (err) {
      console.error('❌ Failed to stop InCallManager:', err);
    }
  }, [isVideoCall]);

  // ============================================
  // Update Remote Video Track
  // ============================================

  const updateRemoteVideoTrack = useCallback((participant: RemoteParticipant) => {
    const videoTrack = Array.from(participant.videoTrackPublications.values())
      .find(pub => pub.track && pub.source === Track.Source.Camera);

    if (videoTrack?.track) {
      setRemoteVideoTrack(videoTrack.track as RemoteVideoTrack);
      console.log('🎥 Remote video track found');
    } else {
      setRemoteVideoTrack(null);
      console.log('🎥 Remote video track not available');
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

      if (isVideoCall) {
        updateRemoteVideoTrack(participant);
      }
    });

    // Remote Participant Left
    room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      console.log('👤 Remote Participant Disconnected:', participant.identity);
      setRemoteParticipant(null);
      setRemoteVideoTrack(null);
    });

    // Track Subscribed (when remote track becomes available)
    room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      console.log('📡 Track Subscribed:', track.kind, 'from', participant.identity);

      if (track.kind === 'video' && publication.source === Track.Source.Camera) {
        setRemoteVideoTrack(track as RemoteVideoTrack);
      }
    });

    // Track Unsubscribed
    room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
      console.log('📡 Track Unsubscribed:', track.kind, 'from', participant.identity);

      if (track.kind === 'video' && publication.source === Track.Source.Camera) {
        setRemoteVideoTrack(null);
      }
    });

    // Track Muted/Unmuted (remote participant toggles camera)
    room.on(RoomEvent.TrackMuted, (publication, participant) => {
      console.log('🔇 Track Muted:', publication.kind, 'from', participant.identity);

      if (publication.kind === 'video' && publication.source === Track.Source.Camera) {
        setRemoteVideoTrack(null);
      }
    });

    room.on(RoomEvent.TrackUnmuted, (publication, participant) => {
      console.log('🔊 Track Unmuted:', publication.kind, 'from', participant.identity);

      if (publication.kind === 'video' && publication.source === Track.Source.Camera) {
        const remoteParticipant = room.remoteParticipants.get(participant.identity);
        if (remoteParticipant) {
          updateRemoteVideoTrack(remoteParticipant);
        }
      }
    });

    // Handle Disconnection
    room.on(RoomEvent.Disconnected, (reason) => {
      console.log('❌ Disconnected from room:', reason);
      setConnectionState('DISCONNECTED');
      stopInCallManager();
    });

  }, [startInCallManager, stopInCallManager, isVideoCall, updateRemoteVideoTrack]);

  // ============================================
  // Connect to Room
  // ============================================

  const connect = useCallback(async (credentials: LiveKitCredentials) => {
    try {
      setError(null);
      setConnectionState('CONNECTING');

      console.log('🚀 Connecting to LiveKit Room:', credentials.roomName, '| Type:', callType);

      // Create new Room instance
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: isVideoCall ? {
          resolution: VideoPresets.h720.resolution,
        } : undefined,
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

      // Enable camera for video calls
      if (isVideoCall) {
        await newRoom.localParticipant.setCameraEnabled(true);
        setIsCameraOff(false);

        // Get local video track
        const localVideo = Array.from(newRoom.localParticipant.videoTrackPublications.values())
          .find(pub => pub.track && pub.source === Track.Source.Camera);

        if (localVideo?.track) {
          setLocalVideoTrack(localVideo.track as LocalVideoTrack);
          console.log('🎥 Local video track enabled');
        }
      }

      // Check if there are already participants in the room
      const remoteParticipants = Array.from(newRoom.remoteParticipants.values());
      if (remoteParticipants.length > 0) {
        const firstParticipant = remoteParticipants[0];
        setRemoteParticipant(firstParticipant);
        console.log('👤 Found existing remote participant:', firstParticipant.identity);

        if (isVideoCall) {
          updateRemoteVideoTrack(firstParticipant);
        }
      }

    } catch (err: any) {
      console.error('❌ Failed to connect to LiveKit:', err);
      setError(err.message || 'Failed to connect to call');
      setConnectionState('ERROR');
      stopInCallManager();
    }
  }, [setupRoomEventListeners, stopInCallManager, callType, isVideoCall, updateRemoteVideoTrack]);

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
        setLocalVideoTrack(null);
        setRemoteVideoTrack(null);
        setConnectionState('DISCONNECTED');
      }

      stopInCallManager();
    } catch (err) {
      console.error('❌ Error disconnecting:', err);
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
      setIsSpeakerOn(prev => !prev);
      return;
    }

    try {
      const newSpeakerState = !isSpeakerOn;
      InCallManager.setSpeakerphoneOn(newSpeakerState);
      setIsSpeakerOn(newSpeakerState);
      console.log('🔊 Speaker:', newSpeakerState ? 'On' : 'Off');
    } catch (err) {
      console.error('❌ Error toggling speaker:', err);
      setIsSpeakerOn(prev => !prev);
    }
  }, [isSpeakerOn]);

  // ============================================
  // Toggle Camera (Video only)
  // ============================================

  const toggleCamera = useCallback(async () => {
    if (!roomRef.current || !isVideoCall) return;

    try {
      const newCameraState = !isCameraOff;
      await roomRef.current.localParticipant.setCameraEnabled(!newCameraState);
      setIsCameraOff(newCameraState);

      if (newCameraState) {
        // Camera turned OFF
        setLocalVideoTrack(null);
        console.log('📷 Camera: Off');
      } else {
        // Camera turned ON - get the new track
        const localVideo = Array.from(roomRef.current.localParticipant.videoTrackPublications.values())
          .find(pub => pub.track && pub.source === Track.Source.Camera);

        if (localVideo?.track) {
          setLocalVideoTrack(localVideo.track as LocalVideoTrack);
        }
        console.log('📷 Camera: On');
      }
    } catch (err) {
      console.error('❌ Error toggling camera:', err);
    }
  }, [isCameraOff, isVideoCall]);

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
    localVideoTrack,
    remoteVideoTrack,
    isMuted,
    toggleMute,
    isSpeakerOn,
    toggleSpeaker,
    isCameraOff,
    toggleCamera,
    connect,
    disconnect,
  };
}