import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export const EmptyTelecallerState: React.FC = () => {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="relative mb-8">
        <View className="w-40 h-40 rounded-full bg-primary/5 items-center justify-center">
          <View className="w-28 h-28 rounded-full bg-primary/10 items-center justify-center">
            <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center">
              <Ionicons name="people" size={40} color="#8B5CF6" />
            </View>
          </View>
        </View>

        <View className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-success/20 items-center justify-center">
          <View className="w-3 h-3 rounded-full bg-success" />
        </View>
        <View className="absolute -bottom-1 -left-3 w-6 h-6 rounded-full bg-warning/20 items-center justify-center">
          <View className="w-2 h-2 rounded-full bg-warning" />
        </View>
        <View className="absolute top-1/2 -right-4 w-5 h-5 rounded-full bg-destructive/30 items-center justify-center">
          <View className="w-2 h-2 rounded-full bg-destructive" />
        </View>
      </View>

      <Text
        allowFontScaling={false}
        className="text-xl font-bold text-text text-center mb-3"
      >
        No Telecallers Available
      </Text>
      <Text
        allowFontScaling={false}
        className="text-base text-textMuted text-center leading-6 max-w-xs"
      >
        It looks like all our telecallers are busy at the moment. Please check back in a few minutes!
      </Text>

      <View className="mt-8 flex-row items-center px-4 py-3 bg-primary/5 rounded-xl">
        <Ionicons name="time-outline" size={20} color="#8B5CF6" />
        <Text
          allowFontScaling={false}
          className="text-sm text-primary ml-2 font-medium"
        >
          Pull down to refresh
        </Text>
      </View>
    </View>
  );
};