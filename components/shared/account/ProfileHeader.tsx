import { Avatar } from "@/components/shared/avatars";
import { getInitials } from "@/utils/formatter";
import React from "react";
import { Text, View } from "react-native";

interface ProfileHeaderProps {
  name: string | undefined;
  phone: string | undefined;
  profile?: string | null;
}

export function ProfileHeader({ name, phone, profile }: ProfileHeaderProps) {
  const hasProfile = profile && profile.startsWith("avatar-");

  return (
    <View className="items-center pt-6 pb-4">
      <View className="relative mb-4">
        <View className={`w-28 h-28 rounded-full overflow-hidden items-center justify-center ${hasProfile ? "bg-transparent" : "bg-primary/20"}`}>
          {hasProfile ? (
            <Avatar avatarId={profile} size={95} />
          ) : (
            <Text
              className="text-3xl font-nexaHeavy text-primary"
              allowFontScaling={false}
            >
              {getInitials(name)}
            </Text>
          )}
        </View>

        <View
          className="absolute top-0 left-0 w-28 h-28 rounded-full border-4 border-primary"
          pointerEvents="none"
        />
      </View>

      <Text
        className="text-2xl max-w-xs line-clamp-1 font-nexaHeavy text-text"
        allowFontScaling={false}
      >
        {name}
      </Text>

      <Text className="text-base text-textMuted" allowFontScaling={false}>
        {phone}
      </Text>
    </View>
  );
}