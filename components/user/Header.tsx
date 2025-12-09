import { USER_HEADER_CONTENTS } from "@/constants/navigation";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/utils/formatter";
import { FontAwesome6 } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "../shared/avatars";

interface HeaderProps {
  onMenuPress: () => void;
}

const formatCoinNumber = (num: number): string => {
  if (num >= 1000000) {
    const formatted = (num / 1000000).toFixed(1);
    return formatted.endsWith(".0") ? formatted.slice(0, -2) + "M" : formatted + "M";
  }
  if (num >= 1000) {
    const formatted = (num / 1000).toFixed(1);
    return formatted.endsWith(".0") ? formatted.slice(0, -2) + "K" : formatted + "K";
  }
  return num.toString();
};

export const Header: React.FC<HeaderProps> = ({ onMenuPress }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  if (!user) {
    router.replace("/(auth)/login");
    return;
  };

  const isHome = pathname === "/home" || pathname === "/(user)/home";
  const headerContent = USER_HEADER_CONTENTS[pathname];

  if (isHome) {
    return (
      <View className="bg-background" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-6 py-3">
          <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7}>
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
          </TouchableOpacity>

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
              {user?.name || "User"}
            </Text>
          </View>

          <TouchableOpacity
            className="flex-row items-center bg-white/80 border border-muted px-2.5 py-2 rounded-2xl"
            activeOpacity={0.7}
            onPress={() => router.push("/(app)/(user)/recharge")}
          >
            <View className="w-8 h-8 rounded-lg bg-amber-100 items-center justify-center mr-2">
              <FontAwesome6 name="coins" size={14} color="#F59E0B" />
            </View>
            <View>
              <Text
                allowFontScaling={false}
                className="text-xs text-textMuted leading-tight"
              >
                Balance
              </Text>
              <Text
                allowFontScaling={false}
                className="text-sm font-bold text-text leading-tight"
              >
                {formatCoinNumber(user?.wallet?.balance || 0)}
              </Text>
            </View>
          </TouchableOpacity>
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