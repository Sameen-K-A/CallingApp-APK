import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface HelpItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  iconColor?: string;
  iconBgColor?: string;
}

export const HelpItem: React.FC<HelpItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  iconColor = "#8B5CF6",
  iconBgColor = "bg-primary/10",
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      className="flex-row items-center py-4 px-4 bg-card rounded-2xl mb-3"
    >
      <View className={`w-10 h-10 rounded-full ${iconBgColor} items-center justify-center mr-4`}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>

      <View className="flex-1">
        <Text
          allowFontScaling={false}
          className="text-base font-semibold text-text"
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            allowFontScaling={false}
            className="text-sm text-textMuted mt-0.5"
          >
            {subtitle}
          </Text>
        )}
      </View>

      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );
};