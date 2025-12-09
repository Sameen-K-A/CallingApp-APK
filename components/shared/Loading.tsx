import { AuroraBackground } from "@/components/ui/aurora-background";
import * as React from "react";
import { Animated, Easing, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Loading() {
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 1500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();
  }, [progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <AuroraBackground />

      <View className="flex-1 px-6">
        <View className="flex-1 items-center justify-center">
          <Text
            allowFontScaling={false}
            className="text-4xl font-nexaHeavy text-primary text-center"
          >
            App Name
          </Text>

          <Text
            allowFontScaling={false}
            className="text-base font-nexaExtraLight text-mutedForeground text-center mt-2"
          >
            This is the application tagline
          </Text>
        </View>

        <View className="h-10 w-full overflow-hidden rounded-full bg-secondary">
          <Animated.View
            className="h-full bg-primary rounded-full"
            style={{ width: progressWidth }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}