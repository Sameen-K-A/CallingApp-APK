import { LiveKitCredentials } from '@/socket/types';
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

  // Camera Control (Video only)
  isCameraOff: boolean;
  toggleCamera: () => Promise<void>;

  // Connection Methods
  connect: (credentials: LiveKitCredentials) => Promise<void>;
  disconnect: () => Promise<void>;
}

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
  const [isCameraOff, setIsCameraOff] = useState(!isVideoCall);

  // Operation Lock (Prevent Double Toggles)
  const isToggleProcessing = useRef(false);

  // ============================================
  // Helpers
  // ============================================

  const getCameraTrackFromParticipant = useCallback((participant: RemoteParticipant): RemoteVideoTrack | null => {
    const publication = participant.getTrackPublication(Track.Source.Camera);
    if (publication && publication.isSubscribed && publication.track) {
      return publication.track as RemoteVideoTrack;
    }
    return null;
  }, []);

  const updateRemoteVideoTrack = useCallback((participant: RemoteParticipant) => {
    const track = getCameraTrackFromParticipant(participant);
    setRemoteVideoTrack(track);
  }, [getCameraTrackFromParticipant]);

  // ============================================
  // Room Event Handlers
  // ============================================

  const setupRoomEventListeners = useCallback((currentRoom: Room) => {
    // 1. Connection State
    currentRoom.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
      console.log('🔌 LiveKit Connection State:', state);
      switch (state) {
        case ConnectionState.Connecting:
          setConnectionState('CONNECTING');
          break;
        case ConnectionState.Connected:
          setConnectionState('CONNECTED');
          setLocalParticipant(currentRoom.localParticipant);
          break;
        case ConnectionState.Disconnected:
          setConnectionState('DISCONNECTED');
          setRoom(null);
          break;
        case ConnectionState.Reconnecting:
          console.log('🔄 Reconnecting to LiveKit...');
          break;
      }
    });

    // 2. Participant Connected
    currentRoom.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      console.log('👤 Remote Participant Connected:', participant.identity);
      setRemoteParticipant(participant);
      updateRemoteVideoTrack(participant);
    });

    // 3. Participant Disconnected
    currentRoom.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      console.log('👤 Remote Participant Disconnected:', participant.identity);
      setRemoteParticipant(null);
      setRemoteVideoTrack(null);
    });

    // 4. Track Subscribed (Video available)
    currentRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      if (track.kind === Track.Kind.Video && publication.source === Track.Source.Camera) {
        console.log('🎥 Remote Camera Subscribed:', participant.identity);
        setRemoteVideoTrack(track as RemoteVideoTrack);
      }
    });

    // 5. Track Unsubscribed (Video unavailable)
    currentRoom.on(RoomEvent.TrackUnsubscribed, (track, publication) => {
      if (track.kind === Track.Kind.Video && publication.source === Track.Source.Camera) {
        console.log('🎥 Remote Camera Unsubscribed');
        setRemoteVideoTrack(null);
      }
    });

    // 6. Track Muted (User turned off camera)
    currentRoom.on(RoomEvent.TrackMuted, (publication) => {
      if (publication.kind === Track.Kind.Video && publication.source === Track.Source.Camera) {
        setRemoteVideoTrack(null);
      }
    });

    // 7. Track Unmuted (User turned on camera)
    currentRoom.on(RoomEvent.TrackUnmuted, (publication, participant) => {
      if (
        publication.kind === Track.Kind.Video &&
        publication.source === Track.Source.Camera &&
        participant instanceof RemoteParticipant
      ) {
        updateRemoteVideoTrack(participant);
      }
    });

    // 8. Disconnected
    currentRoom.on(RoomEvent.Disconnected, (reason) => {
      console.log('❌ Room Disconnected:', reason);
      setConnectionState('DISCONNECTED');
    });

  }, [updateRemoteVideoTrack]);

  // ============================================
  // Connect to Room
  // ============================================

  const connect = useCallback(async (credentials: LiveKitCredentials) => {
    try {
      setError(null);
      setConnectionState('CONNECTING');
      console.log('🚀 Connecting to LiveKit Room:', credentials.roomName);

      // Create Room
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: VideoPresets.h540.resolution,
        },
        publishDefaults: {
          simulcast: true,
          videoSimulcastLayers: [
            VideoPresets.h180,
            VideoPresets.h360,
          ],
        }
      });

      roomRef.current = newRoom;
      setRoom(newRoom);

      // Setup Listeners
      setupRoomEventListeners(newRoom);

      // Connect
      await newRoom.connect(credentials.url, credentials.token, {
        autoSubscribe: true,
      });

      // --- Setup Initial Media State ---

      // 1. Audio (Always on initially)
      await newRoom.localParticipant.setMicrophoneEnabled(true);
      setIsMuted(false);

      // 2. Video (Depends on callType)
      if (isVideoCall) {
        await newRoom.localParticipant.setCameraEnabled(true);
        setIsCameraOff(false);

        // Fetch the created local video track
        const localPublication = newRoom.localParticipant.getTrackPublication(Track.Source.Camera);
        if (localPublication && localPublication.track) {
          setLocalVideoTrack(localPublication.track as LocalVideoTrack);
        }
      } else {
        setIsCameraOff(true);
      }

      // 3. Check for existing participants
      if (newRoom.remoteParticipants.size > 0) {
        const firstParticipant = Array.from(newRoom.remoteParticipants.values())[0];
        setRemoteParticipant(firstParticipant);
        updateRemoteVideoTrack(firstParticipant);
      }

    } catch (err: any) {
      console.error('❌ Failed to connect:', err);
      setError(err.message || 'Connection failed');
      setConnectionState('ERROR');
    }
  }, [setupRoomEventListeners, isVideoCall, updateRemoteVideoTrack]);

  // ============================================
  // Disconnect
  // ============================================

  const disconnect = useCallback(async () => {
    if (roomRef.current) {
      console.log('👋 Disconnecting...');
      await roomRef.current.disconnect();
      roomRef.current = null;
      setRoom(null);
      setLocalParticipant(null);
      setRemoteParticipant(null);
      setLocalVideoTrack(null);
      setRemoteVideoTrack(null);
      setConnectionState('DISCONNECTED');
    }
  }, []);

  // ============================================
  // Media Controls
  // ============================================

  const toggleMute = useCallback(async () => {
    if (!roomRef.current?.localParticipant || isToggleProcessing.current) return;

    try {
      isToggleProcessing.current = true;
      const newMuteState = !isMuted;

      await roomRef.current.localParticipant.setMicrophoneEnabled(!newMuteState);
      setIsMuted(newMuteState);
    } catch (err) {
      console.error('❌ Toggle mute error:', err);
    } finally {
      isToggleProcessing.current = false;
    }
  }, [isMuted]);

  const toggleCamera = useCallback(async () => {
    if (!roomRef.current?.localParticipant || isToggleProcessing.current) return;

    try {
      isToggleProcessing.current = true;
      const newCameraState = !isCameraOff; // Current is Off? Then New is On.

      await roomRef.current.localParticipant.setCameraEnabled(!newCameraState);
      setIsCameraOff(newCameraState);

      if (newCameraState) {
        // Camera turned OFF
        setLocalVideoTrack(null);
      } else {
        // Camera turned ON
        const pub = roomRef.current.localParticipant.getTrackPublication(Track.Source.Camera);
        if (pub && pub.track) {
          setLocalVideoTrack(pub.track as LocalVideoTrack);
        }
      }
    } catch (err) {
      console.error('❌ Toggle camera error:', err);
    } finally {
      isToggleProcessing.current = false;
    }
  }, [isCameraOff]);

  // ============================================
  // Cleanup
  // ============================================

  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

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
    isCameraOff,
    toggleCamera,
    connect,
    disconnect,
  };
}