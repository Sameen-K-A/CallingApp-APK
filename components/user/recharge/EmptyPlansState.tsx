import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export const EmptyPlansState: React.FC = () => {
  return (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View className="w-20 h-20 rounded-full bg-muted items-center justify-center mb-5">
        <Ionicons name="card-outline" size={36} color="#6B7280" />
      </View>

      <Text
        allowFontScaling={false}
        className="text-lg font-bold text-text mb-2 text-center"
      >
        No Plans Available
      </Text>

      <Text
        allowFontScaling={false}
        className="text-sm text-textMuted text-center leading-5"
      >
        Recharge plans are currently unavailable. Please try again later.
      </Text>
    </View>
  );
};