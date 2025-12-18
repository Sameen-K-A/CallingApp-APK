import { CallControls } from "@/components/call/CallControls";
import { SelfVideoPreview } from "@/components/call/SelfVideoPreview";
import { Avatar } from "@/components/shared/avatars";
import { getInitials } from "@/utils/formatter";
import { Ionicons } from "@expo/vector-icons";
import { VideoView } from "@livekit/react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LocalVideoTrack, RemoteVideoTrack } from "livekit-client";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface VideoConnectedStateProps {
  name: string;
  profile?: string;
  timer: string;
  isWaitingForRemote: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isCameraOff: boolean;
  isRemoteCameraOff: boolean;
  localVideoTrack: LocalVideoTrack | null;
  remoteVideoTrack: RemoteVideoTrack | null;
  topInset: number;
  bottomInset: number;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
}

// ============================================
// Remote Video View Component
// ============================================

interface RemoteVideoViewProps {
  track: RemoteVideoTrack;
}

const RemoteVideoView: React.FC<RemoteVideoViewProps> = ({ track }) => {
  return (
    <VideoView
      videoTrack={track}
      style={{ flex: 1 }}
      objectFit="cover"
      zOrder={0}
    />
  );
};

// ============================================
// Waiting For Remote State
// ============================================

interface WaitingStateProps {
  name: string;
  profile?: string;
}

const WaitingState: React.FC<WaitingStateProps> = ({ name, profile }) => {
  return (
    <View className="flex-1 bg-neutral-900 items-center justify-center">
      <ActivityIndicator size="large" color="#A855F7" style={{ marginBottom: 16 }} />
      <Text
        allowFontScaling={false}
        className="text-white text-xl font-semibold mb-2"
      >
        Connecting...
      </Text>
      <Text
        allowFontScaling={false}
        className="text-white/50 text-sm"
      >
        Waiting for {name} to join
      </Text>
    </View>
  );
};

// ============================================
// Remote Camera Off State
// ============================================

interface CameraOffStateProps {
  name: string;
  profile?: string;
}

const CameraOffState: React.FC<CameraOffStateProps> = ({ name, profile }) => {
  return (
    <View className="flex-1 bg-neutral-900 items-center justify-center">
      <View className="w-32 h-32 rounded-full bg-white/10 border-2 border-white/20 items-center justify-center overflow-hidden mb-4">
        {profile?.startsWith("avatar-") ? (
          <Avatar avatarId={profile} size={120} />
        ) : (
          <Text
            allowFontScaling={false}
            className="text-4xl font-bold text-white"
          >
            {getInitials(name)}
          </Text>
        )}
      </View>

      <View className="flex-row items-center bg-white/10 px-3 py-1.5 rounded-full">
        <Ionicons name="videocam-off" size={14} color="#FFFFFF80" />
        <Text
          allowFontScaling={false}
          className="text-xs text-white/50 ml-1.5"
        >
          Camera is off
        </Text>
      </View>
    </View>
  );
};

// ============================================
// Loading Video State
// ============================================

const LoadingVideoState: React.FC = () => {
  return (
    <View className="flex-1 bg-neutral-800 items-center justify-center">
      <ActivityIndicator size="large" color="#A855F7" />
      <Text
        allowFontScaling={false}
        className="text-white/50 text-sm mt-2"
      >
        Loading video...
      </Text>
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
  isWaitingForRemote,
  isMuted,
  isSpeakerOn,
  isCameraOff,
  isRemoteCameraOff,
  localVideoTrack,
  remoteVideoTrack,
  topInset,
  bottomInset,
  onToggleMute,
  onToggleSpeaker,
  onToggleCamera,
  onEndCall,
}) => {
  // Determine what to show in the main video area
  const renderMainContent = () => {
    // Waiting for remote participant to join
    if (isWaitingForRemote) {
      return <WaitingState name={name} profile={profile} />;
    }

    // Remote participant joined but camera is off
    if (isRemoteCameraOff) {
      return <CameraOffState name={name} profile={profile} />;
    }

    // Remote participant has video track
    if (remoteVideoTrack) {
      return <RemoteVideoView track={remoteVideoTrack} />;
    }

    // Fallback: waiting for video track
    return <LoadingVideoState />;
  };

  return (
    <View className="flex-1">
      {/* Remote Video / Placeholder (Full Screen Background) */}
      <View className="absolute inset-0">
        {renderMainContent()}
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
            <Text
              allowFontScaling={false}
              className="text-sm text-white/70 tracking-wider"
            >
              Connecting...
            </Text>
          </View>
        ) : (
          <Text
            allowFontScaling={false}
            className="text-sm text-white/70 tracking-wider"
          >
            {timer}
          </Text>
        )}
      </View>

      {/* Self Video Preview (Bottom Right) */}
      <View
        className="absolute right-6"
        style={{ bottom: bottomInset + 120 }}
      >
        <SelfVideoPreview
          name="You"
          profile={undefined}
          isCameraOff={isCameraOff}
          localVideoTrack={localVideoTrack}
        />
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
      <View
        className="absolute bottom-0 left-0 right-0"
        style={{ paddingBottom: bottomInset + 24 }}
      >
        <CallControls
          callType="VIDEO"
          isMuted={isMuted}
          isSpeakerOn={isSpeakerOn}
          isCameraOff={isCameraOff}
          onToggleMute={onToggleMute}
          onToggleSpeaker={onToggleSpeaker}
          onToggleCamera={onToggleCamera}
          onEndCall={onEndCall}
        />
      </View>
    </View>
  );
};