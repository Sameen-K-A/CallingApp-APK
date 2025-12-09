import { TabItem, USER_TAB_ITEMS } from "@/constants/navigation";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TabBarProps {
  onMenuPress: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({ onMenuPress }) => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActiveRoute = (route?: string): boolean => {
    if (!route) return false;
    const routePath = route.split("/").pop();
    return pathname.includes(routePath || "");
  };

  const handlePress = (tab: TabItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (tab.action === "menu") {
      onMenuPress();
    } else if (tab.route) {
      router.push(tab.route as any);
    }
  };

  const bottomPadding = Platform.select({
    ios: Math.min(insets.bottom, 8),
    android: Math.max(insets.bottom, 8),
    default: 8,
  });

  return (
    <View
      className="flex-row items-center justify-around py-2 px-6 bg-background border-t border-border"
      style={{ paddingBottom: bottomPadding }}
    >
      {USER_TAB_ITEMS.map((tab) => {
        const isActive = isActiveRoute(tab.route);
        const iconName = isActive ? tab.iconFocused : tab.icon;

        return (
          <TouchableOpacity
            key={tab.id}
            className="flex items-center justify-center py-1"
            activeOpacity={0.7}
            onPress={() => handlePress(tab)}
          >
            <View className={`items-center justify-center px-5 py-2.5 rounded-xl overflow-hidden ${isActive ? "bg-primary/10" : "bg-transparent"}`}>
              <Ionicons
                name={iconName}
                size={24}
                color={isActive ? "#8B5CF6" : "#6B7280"}
              />
            </View>
            <Text
              allowFontScaling={false}
              className={`text-xs ${isActive ? "text-primary font-semibold" : "text-textMuted"}`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};