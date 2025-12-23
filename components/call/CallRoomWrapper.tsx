import { LiveKitCredentials } from '@/socket/types';
import { AudioSession, LiveKitRoom } from '@livekit/react-native';
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

interface CallRoomWrapperProps {
  credentials: LiveKitCredentials;
  callType: 'AUDIO' | 'VIDEO';
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
  children: React.ReactNode;
}

export const CallRoomWrapper: React.FC<CallRoomWrapperProps> = ({
  credentials,
  callType,
  onConnected,
  onDisconnected,
  onError,
  children,
}) => {
  const isVideoCall = callType === 'VIDEO';
  const audioSessionStarted = useRef(false);

  useEffect(() => {
    const setupAudio = async () => {
      if (audioSessionStarted.current) return;

      try {
        await AudioSession.startAudioSession();
        audioSessionStarted.current = true;
        console.log('🔊 Audio session started');

        // Force speaker for video calls on Android
        if (Platform.OS === 'android' && isVideoCall) {
          setTimeout(async () => {
            try {
              const outputs = await AudioSession.getAudioOutputs();
              if (outputs.includes('speaker')) {
                await AudioSession.selectAudioOutput('speaker');
                console.log('🔊 Selected speaker');
              }
            } catch (e) {
              // Ignore
              console.log(e)
            }
          }, 1000);
        }
      } catch (error) {
        console.error('❌ Failed to start audio session:', error);
      }
    };

    setupAudio();

    return () => {
      if (audioSessionStarted.current) {
        AudioSession.stopAudioSession();
        audioSessionStarted.current = false;
        console.log('🔇 Audio session stopped');
      }
    };
  }, [isVideoCall]);

  const handleConnected = () => {
    console.log('✅ LiveKit Connected');

    // Ensure volume is up when connected
    if (Platform.OS === 'android') {
      AudioSession.setDefaultRemoteAudioTrackVolume(1.0);
    }

    onConnected?.();
  };

  return (
    <LiveKitRoom
      serverUrl={credentials.url}
      token={credentials.token}
      connect={true}
      audio={true}
      video={isVideoCall}
      onConnected={handleConnected}
      onDisconnected={onDisconnected}
      onError={onError}
      options={{
        adaptiveStream: { pixelDensity: 'screen' },
        dynacast: true,
        publishDefaults: {
          simulcast: true,
        },
      }}
    >
      {children}
    </LiveKitRoom>
  );
};