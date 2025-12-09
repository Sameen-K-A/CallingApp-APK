import { TELECALLER_HEADER_CONTENTS } from "@/constants/navigation";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/utils/formatter";
import { router, usePathname } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "../shared/avatars";

export const Header: React.FC = () => {
  const { user } = useAuth();
  if (!user) {
    router.replace("/(auth)/login");
    return;
  };

  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isDashboard = pathname === "/dashboard" || pathname === "/(telecaller)/dashboard";
  const headerContent = TELECALLER_HEADER_CONTENTS[pathname];

  if (isDashboard) {
    return (
      <View className="bg-background" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-6 py-3">
          <View className="w-12 h-12 rounded-full bg-muted border border-primary items-center overflow-hidden justify-center">
            {user?.profile && user.profile.startsWith("avatar-") ? (
              <Avatar avatarId={user?.profile} size={45} />
            ) : (
              <Text
                className="font-semibold text-primary"
                allowFontScaling={false}
              >
                {getInitials(user?.name)}
              </Text>
            )}
          </View>

          <View className="flex-1 ml-3">
            <Text
              allowFontScaling={false}
              className="text-xs text-textMuted"
            >
              Hey,
            </Text>
            <Text
              allowFontScaling={false}
              className="text-xl max-w-[12rem] line-clamp-1 font-bold text-text"
            >
              {user?.name || "Tele-caller"}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row px-6 py-3">
        <View className="flex-1">
          <Text allowFontScaling={false} className="text-xl font-bold text-text text-center">
            {headerContent?.heading || "Page"}
          </Text>

          <Text allowFontScaling={false} className="text-sm text-textMuted text-center">
            {headerContent?.description || "Description"}
          </Text>
        </View>
      </View>
    </View>
  );
};