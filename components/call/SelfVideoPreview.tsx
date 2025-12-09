import { Avatar } from "@/components/shared/avatars";
import { getInitials } from "@/utils/formatter";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface SelfVideoPreviewProps {
  name: string;
  profile?: string;
  isCameraOff: boolean;
}

export const SelfVideoPreview: React.FC<SelfVideoPreviewProps> = ({ name, profile, isCameraOff }) => {
  return (
    <View className="w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/20">
      {isCameraOff ? (
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
      ) : (
        <View className="flex-1 bg-neutral-700 items-center justify-center">
          <Ionicons name="person" size={40} color="#FFFFFF50" />
          <Text
            allowFontScaling={false}
            className="text-xs text-white/50 mt-1"
          >
            You
          </Text>
        </View>
      )}
    </View>
  );
};