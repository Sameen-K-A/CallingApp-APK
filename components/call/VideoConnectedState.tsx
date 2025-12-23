import { CallControls } from "@/components/call/CallControls";
import { Avatar } from "@/components/shared/avatars";
import { useLiveKitControls } from "@/hooks/useLiveKitRoom";
import { getInitials } from "@/utils/formatter";
import { Ionicons } from "@expo/vector-icons";
import { VideoTrack, useTracks } from "@livekit/react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Track } from "livekit-client";
import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface VideoConnectedStateProps {
  name: string;
  profile?: string;
  timer: string;
  topInset: number;
  bottomInset: number;
  onTimerStart: () => void;
  onEndCall: () => void;
}

// ============================================
// Waiting For Remote State
// ============================================
const WaitingState: React.FC<{ name: string }> = ({ name }) => {
  return (
    <View className="flex-1 bg-neutral-900 items-center justify-center">
      <ActivityIndicator size="large" color="#A855F7" style={{ marginBottom: 16 }} />
      <Text allowFontScaling={false} className="text-white font-semibold mb-2">
        Connecting...
      </Text>
      <Text allowFontScaling={false} className="text-mutedForeground text-xs">
        Waiting for {name} to join
      </Text>
    </View>
  );
};

// ============================================
// Remote Camera Off State
// ============================================
const CameraOffState: React.FC<{ name: string; profile?: string }> = ({ name, profile }) => {
  return (
    <View className="flex-1 bg-neutral-900 items-center justify-center">
      <View className="w-32 h-32 rounded-full bg-white/10 border-2 border-white/20 items-center justify-center overflow-hidden mb-4">
        {profile?.startsWith("avatar-") ? (
          <Avatar avatarId={profile} size={120} />
        ) : (
          <Text allowFontScaling={false} className="text-4xl font-bold text-white">
            {getInitials(name)}
          </Text>
        )}
      </View>

      <View className="flex-row items-center bg-white/10 px-3 py-1.5 rounded-full">
        <Ionicons name="videocam-off" size={14} color="#FFFFFF80" />
        <Text allowFontScaling={false} className="text-xs text-white/50 ml-1.5">
          Camera is off
        </Text>
      </View>
    </View>
  );
};

// ============================================
// Main Component
// ============================================
export const VideoConnectedState: React.FC<VideoConnectedStateProps> = ({
  name,
  profile,
  timer,
  topInset,
  bottomInset,
  onTimerStart,
  onEndCall,
}) => {
  const {
    connectionState,
    hasRemoteParticipant,
    isRemoteCameraOff,
    isMuted,
    toggleMute,
    isCameraOff,
    toggleCamera,
  } = useLiveKitControls('VIDEO');

  // Get all video tracks
  const tracks = useTracks([Track.Source.Camera]);

  // Find remote and local camera tracks
  const remoteCameraTrack = useMemo(() => {
    return tracks.find(
      (trackRef) => !trackRef.participant.isLocal && trackRef.source === Track.Source.Camera
    );
  }, [tracks]);

  const localCameraTrack = useMemo(() => {
    return tracks.find(
      (trackRef) => trackRef.participant.isLocal && trackRef.source === Track.Source.Camera
    );
  }, [tracks]);

  const isWaitingForRemote = connectionState !== 'CONNECTED' || !hasRemoteParticipant;

  // Start timer when both parties are connected
  useEffect(() => {
    if (connectionState === 'CONNECTED' && hasRemoteParticipant) {
      onTimerStart();
    }
  }, [connectionState, hasRemoteParticipant, onTimerStart]);

  // Render remote video section
  const renderRemoteVideo = () => {
    if (isWaitingForRemote) {
      return <WaitingState name={name} />;
    }

    if (isRemoteCameraOff || !remoteCameraTrack) {
      return <CameraOffState name={name} profile={profile} />;
    }

    return (
      <VideoTrack
        trackRef={remoteCameraTrack}
        style={{ flex: 1 }}
        objectFit="cover"
        zOrder={0}
      />
    );
  };

  // Render local video preview
  const renderLocalVideo = () => {
    if (isCameraOff || !localCameraTrack) {
      return (
        <View className="w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/20 bg-neutral-800 items-center justify-center">
          <View className="w-14 h-14 rounded-full bg-white/10 items-center justify-center">
            <Ionicons name="videocam-off" size={24} color="#FFFFFF80" />
          </View>
        </View>
      );
    }

    return (
      <View
        className="w-28 h-40 border-2 border-white/20"
        style={{ borderRadius: 16, overflow: "hidden" }}
      >
        <VideoTrack
          trackRef={localCameraTrack}
          style={{ flex: 1, borderRadius: 16 }}
          objectFit="cover"
          mirror
          zOrder={1}
        />
      </View>
    );
  };

  return (
    <View className="flex-1">
      {/* Remote Video / Placeholder (Full Screen Background) */}
      <View className="absolute inset-0">
        {renderRemoteVideo()}
      </View>

      {/* Top Gradient Overlay */}
      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.4)", "transparent"]}
        locations={[0, 0.5, 1]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: topInset + 80,
        }}
      />

      {/* Header: Name and Timer */}
      <View style={{ paddingTop: topInset + 16 }} className="px-6">
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          className="text-xl font-bold text-white font-nexaHeavy"
        >
          {name}
        </Text>

        {isWaitingForRemote ? (
          <View className="flex-row items-center mt-1">
            <ActivityIndicator size="small" color="#A855F7" style={{ marginRight: 8 }} />
            <Text allowFontScaling={false} className="text-sm text-white/70 tracking-wider">
              Connecting...
            </Text>
          </View>
        ) : (
          <Text allowFontScaling={false} className="text-sm text-white/70 tracking-wider">
            {timer}
          </Text>
        )}
      </View>

      {/* Self Video Preview (Bottom Right) */}
      <View className="absolute right-6" style={{ bottom: bottomInset + 120 }}>
        {renderLocalVideo()}
      </View>

      {/* Bottom Gradient Overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.8)"]}
        locations={[0, 0.5, 1]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: bottomInset + 120,
        }}
      />

      {/* Call Controls */}
      <View className="absolute bottom-0 left-0 right-0" style={{ paddingBottom: bottomInset + 24 }}>
        <CallControls
          callType="VIDEO"
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          onToggleMute={toggleMute}
          onToggleCamera={toggleCamera}
          onEndCall={onEndCall}
        />
      </View>
    </View>
  );
};