import { CallControls } from "@/components/call/CallControls";
import { SelfVideoPreview } from "@/components/call/SelfVideoPreview";
import { Avatar } from "@/components/shared/avatars";
import { getInitials } from "@/utils/formatter";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";

interface VideoConnectedStateProps {
  name: string;
  profile?: string;
  timer: string;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isCameraOff: boolean;
  isRemoteCameraOff: boolean;
  topInset: number;
  bottomInset: number;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
}

export const VideoConnectedState: React.FC<VideoConnectedStateProps> = ({
  name,
  profile,
  timer,
  isMuted,
  isSpeakerOn,
  isCameraOff,
  isRemoteCameraOff,
  topInset,
  bottomInset,
  onToggleMute,
  onToggleSpeaker,
  onToggleCamera,
  onEndCall,
}) => {
  return (
    <View className="flex-1">
      <View className="absolute inset-0">
        {isRemoteCameraOff ? (
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
        ) : (
          <View className="flex-1 bg-neutral-800 items-center justify-center">
            <Ionicons name="person" size={120} color="#FFFFFF20" />
            <Text
              allowFontScaling={false}
              className="text-sm text-white/20 mt-2"
            >
              Remote Video
            </Text>
          </View>
        )}
      </View>

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

      <View style={{ paddingTop: topInset + 16 }} className="px-6">
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          className="text-xl font-bold text-white font-nexaHeavy"
        >
          {name}
        </Text>

        <Text
          allowFontScaling={false}
          className="text-sm text-white/70 tracking-wider"
        >
          {timer}
        </Text>
      </View>

      <View className="absolute bottom-28 right-6" style={{ marginBottom: bottomInset }}>
        <SelfVideoPreview
          name="You"
          profile={undefined}
          isCameraOff={isCameraOff}
        />
      </View>

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