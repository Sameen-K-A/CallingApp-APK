import {
  useConnectionState,
  useLocalParticipant,
  useRemoteParticipants,
  useRoomContext
} from '@livekit/react-native';
import { ConnectionState, Track } from 'livekit-client';
import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================
// Types
// ============================================
export type RoomConnectionState = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
export type CallType = 'AUDIO' | 'VIDEO';

export interface UseLiveKitControlsReturn {
  // Connection State
  connectionState: RoomConnectionState;

  // Participants
  hasRemoteParticipant: boolean;

  // Remote Camera State (for video calls)
  isRemoteCameraOff: boolean;

  // Audio Controls
  isMuted: boolean;
  toggleMute: () => Promise<void>;

  // Camera Control (Video only)
  isCameraOff: boolean;
  toggleCamera: () => Promise<void>;

  // Disconnect
  disconnect: () => Promise<void>;
}

// ============================================
// Map LiveKit ConnectionState to our state
// ============================================
const mapConnectionState = (state: ConnectionState): RoomConnectionState => {
  switch (state) {
    case ConnectionState.Connecting:
      return 'CONNECTING';
    case ConnectionState.Connected:
      return 'CONNECTED';
    case ConnectionState.Disconnected:
      return 'DISCONNECTED';
    case ConnectionState.Reconnecting:
      return 'CONNECTING';
    default:
      return 'IDLE';
  }
};

// ============================================
// Hook Implementation (Use INSIDE LiveKitRoom context)
// ============================================
export function useLiveKitControls(callType: CallType): UseLiveKitControlsReturn {
  const isVideoCall = callType === 'VIDEO';

  // Get room from context
  const room = useRoomContext();

  // Connection state from LiveKit
  const connectionState = useConnectionState();

  // Local participant
  const { localParticipant } = useLocalParticipant();

  // Remote participants
  const remoteParticipants = useRemoteParticipants();
  const hasRemoteParticipant = remoteParticipants.length > 0;

  // Track remote camera state by checking participant's track publications directly
  const [isRemoteCameraOff, setIsRemoteCameraOff] = useState(true);

  // Media States
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(!isVideoCall);

  // Operation Lock (Prevent Double Toggles)
  const isToggleProcessing = useRef(false);

  // ============================================
  // Monitor remote participant's camera state
  // ============================================
  useEffect(() => {
    if (!hasRemoteParticipant || remoteParticipants.length === 0) {
      setIsRemoteCameraOff(true);
      return;
    }

    const remoteParticipant = remoteParticipants[0];

    // Function to check camera state
    const checkCameraState = () => {
      const cameraPublication = remoteParticipant.getTrackPublication(Track.Source.Camera);

      // Camera is "off" if:
      // 1. No camera publication exists, OR
      // 2. Publication exists but track is not subscribed, OR
      // 3. Publication exists but is muted
      const isCameraOff = !cameraPublication ||
        !cameraPublication.isSubscribed ||
        cameraPublication.isMuted ||
        !cameraPublication.track;

      setIsRemoteCameraOff(isCameraOff);
    };

    // Check initial state
    checkCameraState();

    // Listen for track events on the remote participant
    const handleTrackMuted = () => checkCameraState();
    const handleTrackUnmuted = () => checkCameraState();
    const handleTrackSubscribed = () => checkCameraState();
    const handleTrackUnsubscribed = () => checkCameraState();

    remoteParticipant.on('trackMuted', handleTrackMuted);
    remoteParticipant.on('trackUnmuted', handleTrackUnmuted);
    remoteParticipant.on('trackSubscribed', handleTrackSubscribed);
    remoteParticipant.on('trackUnsubscribed', handleTrackUnsubscribed);

    return () => {
      remoteParticipant.off('trackMuted', handleTrackMuted);
      remoteParticipant.off('trackUnmuted', handleTrackUnmuted);
      remoteParticipant.off('trackSubscribed', handleTrackSubscribed);
      remoteParticipant.off('trackUnsubscribed', handleTrackUnsubscribed);
    };
  }, [hasRemoteParticipant, remoteParticipants]);

  // ============================================
  // Sync local mic/camera state with actual track state
  // ============================================
  useEffect(() => {
    if (!localParticipant) return;

    const syncTrackState = () => {
      const micPub = localParticipant.getTrackPublication(Track.Source.Microphone);
      const camPub = localParticipant.getTrackPublication(Track.Source.Camera);

      // Mic is muted if no track or track is muted
      if (micPub?.track) {
        setIsMuted(micPub.isMuted);
      }

      // Camera is off if no track or track is muted
      if (camPub?.track) {
        setIsCameraOff(camPub.isMuted);
      } else if (isVideoCall) {
        setIsCameraOff(true);
      }
    };

    syncTrackState();

    // Listen for local track changes
    localParticipant.on('trackMuted', syncTrackState);
    localParticipant.on('trackUnmuted', syncTrackState);
    localParticipant.on('localTrackPublished', syncTrackState);
    localParticipant.on('localTrackUnpublished', syncTrackState);

    return () => {
      localParticipant.off('trackMuted', syncTrackState);
      localParticipant.off('trackUnmuted', syncTrackState);
      localParticipant.off('localTrackPublished', syncTrackState);
      localParticipant.off('localTrackUnpublished', syncTrackState);
    };
  }, [localParticipant, isVideoCall]);

  // ============================================
  // Enable camera on connect for video calls
  // ============================================
  useEffect(() => {
    if (connectionState === ConnectionState.Connected && isVideoCall && localParticipant) {
      localParticipant.setCameraEnabled(true).then(() => {
        setIsCameraOff(false);
      }).catch((err) => {
        console.error('❌ Failed to enable camera:', err);
      });
    }
  }, [connectionState, isVideoCall, localParticipant]);

  // ============================================
  // Media Controls
  // ============================================
  const toggleMute = useCallback(async () => {
    if (!localParticipant || isToggleProcessing.current) return;

    try {
      isToggleProcessing.current = true;
      const newMuteState = !isMuted;

      await localParticipant.setMicrophoneEnabled(!newMuteState);
      setIsMuted(newMuteState);
    } catch (err) {
      console.error('❌ Toggle mute error:', err);
    } finally {
      isToggleProcessing.current = false;
    }
  }, [localParticipant, isMuted]);

  const toggleCamera = useCallback(async () => {
    if (!localParticipant || isToggleProcessing.current) return;

    try {
      isToggleProcessing.current = true;
      const newCameraState = !isCameraOff;

      await localParticipant.setCameraEnabled(!newCameraState);
      setIsCameraOff(newCameraState);
    } catch (err) {
      console.error('❌ Toggle camera error:', err);
    } finally {
      isToggleProcessing.current = false;
    }
  }, [localParticipant, isCameraOff]);

  // ============================================
  // Disconnect
  // ============================================
  const disconnect = useCallback(async () => {
    if (room) {
      console.log('👋 Disconnecting from LiveKit...');
      await room.disconnect();
    }
  }, [room]);

  return {
    connectionState: mapConnectionState(connectionState),
    hasRemoteParticipant,
    isRemoteCameraOff,
    isMuted,
    toggleMute,
    isCameraOff,
    toggleCamera,
    disconnect,
  };
}