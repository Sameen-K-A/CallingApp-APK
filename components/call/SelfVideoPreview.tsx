import { Avatar } from "@/components/shared/avatars";
import { getInitials } from "@/utils/formatter";
import { VideoView } from "@livekit/react-native";
import { LocalVideoTrack } from "livekit-client";
import React from "react";
import { Text, View } from "react-native";

interface SelfVideoPreviewProps {
  name: string;
  profile?: string;
  isCameraOff: boolean;
  localVideoTrack: LocalVideoTrack | null;
}

export const SelfVideoPreview: React.FC<SelfVideoPreviewProps> = ({
  name,
  profile,
  isCameraOff,
  localVideoTrack,
}) => {
  const showVideo = !isCameraOff && localVideoTrack !== null;

  return (
    <View className="w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/20">
      {showVideo && localVideoTrack ? (
        <VideoView
          videoTrack={localVideoTrack}
          style={{ flex: 1 }}
          objectFit="cover"
          mirror={true}
          zOrder={1}
        />
      ) : (
        <View className="flex-1 bg-neutral-800 items-center justify-center">
          {profile?.startsWith("avatar-") ? (
            <Avatar avatarId={profile} size={50} />
          ) : (
            <View className="w-14 h-14 rounded-full bg-white/10 items-center justify-center">
              <Text
                allowFontScaling={false}
                className="text-xl font-bold text-white"
              >
                {getInitials(name)}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};