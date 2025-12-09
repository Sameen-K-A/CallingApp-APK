import { Button } from "@/components/ui/button";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export const EmptyCallHistoryState: React.FC = () => {
  const router = useRouter();

  const handleBrowseTelecallers = () => {
    router.push("/(app)/(user)/home");
  };

  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="relative mb-8">
        <View className="w-40 h-40 rounded-full bg-primary/5 items-center justify-center">
          <View className="w-28 h-28 rounded-full bg-primary/10 items-center justify-center">
            <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center">
              <Ionicons name="call" size={40} color="#8B5CF6" />
            </View>
          </View>
        </View>

        <View className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-success/20 items-center justify-center">
          <View className="w-3 h-3 rounded-full bg-success" />
        </View>
        <View className="absolute -bottom-1 -left-3 w-6 h-6 rounded-full bg-warning/20 items-center justify-center">
          <View className="w-2 h-2 rounded-full bg-warning" />
        </View>
        <View className="absolute top-1/2 -right-4 w-5 h-5 rounded-full bg-destructive/20 items-center justify-center">
          <View className="w-2 h-2 rounded-full bg-destructive" />
        </View>
      </View>

      <Text
        allowFontScaling={false}
        className="text-xl font-bold text-text text-center mb-3"
      >
        No Calls Yet
      </Text>

      <Text
        allowFontScaling={false}
        className="text-base text-textMuted text-center leading-6 max-w-xs"
      >
        Your call history will appear here once you start connecting with telecallers. Make your first call today!
      </Text>

      <Button className="mt-8 rounded-xl" onPress={handleBrowseTelecallers}>
        <View className="flex-row items-center px-2">
          <Ionicons name="people" size={18} color="#FFFFFF" />
          <Text
            allowFontScaling={false}
            className="text-base font-semibold text-white ml-2"
          >
            Browse Telecallers
          </Text>
        </View>
      </Button>
    </View>
  );
};