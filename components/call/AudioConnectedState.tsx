import { CallControls } from "@/components/call/CallControls";
import { Avatar } from "@/components/shared/avatars";
import { getInitials } from "@/utils/formatter";
import React from "react";
import { Text, View } from "react-native";

interface AudioConnectedStateProps {
  name: string;
  profile?: string;
  timer: string;
  isMuted: boolean;
  isSpeakerOn: boolean;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
}

export const AudioConnectedState: React.FC<AudioConnectedStateProps> = ({
  name,
  profile,
  timer,
  isMuted,
  isSpeakerOn,
  onToggleMute,
  onToggleSpeaker,
  onEndCall,
}) => {
  return (
    <View className="flex-1">
      <View className="items-center pt-4">
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          className="text-2xl font-nexaHeavy font-bold text-white mb-2"
        >
          {name}
        </Text>

        <Text
          allowFontScaling={false}
          className="font-semibold text-white tracking-wider"
        >
          {timer}
        </Text>
      </View>

      <View className="flex-1 items-center justify-center">
        <View className="w-40 h-40 rounded-full border-2 border-primary items-center justify-center overflow-hidden">
          {profile?.startsWith("avatar-") ? (
            <Avatar avatarId={profile} size={150} />
          ) : (
            <Text
              allowFontScaling={false}
              className="text-5xl font-bold text-white"
            >
              {getInitials(name)}
            </Text>
          )}
        </View>

        <View className="flex-row items-center mt-3 bg-white/10 px-4 py-2 rounded-full">
          <View className="w-2 h-2 rounded-full bg-green-400 mr-2" />
          <Text
            allowFontScaling={false}
            className="text-sm text-white/70 font-medium"
          >
            Voice Call
          </Text>
        </View>
      </View>

      <View className="pb-6">
        <CallControls
          callType="AUDIO"
          isMuted={isMuted}
          isSpeakerOn={isSpeakerOn}
          onToggleMute={onToggleMute}
          onToggleSpeaker={onToggleSpeaker}
          onEndCall={onEndCall}
        />
      </View>
    </View>
  );
};