import { CallControls } from "@/components/call/CallControls";
import { Avatar } from "@/components/shared/avatars";
import { getInitials } from "@/utils/formatter";
import React from "react";
import { Text, View } from "react-native";

interface AudioConnectedStateProps {
  name: string;
  profile?: string;
  timer: string;
  isWaitingForRemote: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onEndCall: () => void;
}

export const AudioConnectedState: React.FC<AudioConnectedStateProps> = ({
  name,
  profile,
  timer,
  isWaitingForRemote,
  isMuted,
  onToggleMute,
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

        {isWaitingForRemote ? (
          <Text
            allowFontScaling={false}
            className="font-semibold text-white/70 tracking-wider text-center"
          >
            Connecting...
          </Text>
        ) : (
          <Text
            allowFontScaling={false}
            className="font-semibold text-white tracking-wider"
          >
            {timer}
          </Text>
        )}
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
          {isWaitingForRemote ? (
            <>
              <View className="w-2 h-2 rounded-full bg-yellow-400 mr-2" />
              <Text
                allowFontScaling={false}
                className="text-sm text-white/70 font-medium"
              >
                Setting up call...
              </Text>
            </>
          ) : (
            <>
              <View className="w-2 h-2 rounded-full bg-green-400 mr-2" />
              <Text
                allowFontScaling={false}
                className="text-sm text-white/70 font-medium"
              >
                Voice Call
              </Text>
            </>
          )}
        </View>
      </View>

      <View className="pb-6">
        <CallControls
          callType="AUDIO"
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          onEndCall={onEndCall}
        />
      </View>
    </View>
  );
};