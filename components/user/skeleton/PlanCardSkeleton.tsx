import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

const SkeletonBox: React.FC<{ className?: string }> = ({ className }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 800 }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={`bg-muted ${className}`}
      style={animatedStyle}
    />
  );
};

const PlanCardSkeleton: React.FC = () => {
  return (
    <View className="bg-card rounded-3xl p-4 border border-muted overflow-hidden">
      <View className="items-center mt-2 mb-4">
        <SkeletonBox className="w-12 h-12 rounded-2xl mb-2" />
        <SkeletonBox className="w-16 h-7 rounded-lg mb-1" />
        <SkeletonBox className="w-10 h-3 rounded" />
      </View>

      <View className="bg-primary/5 rounded-2xl py-3 items-center">
        <SkeletonBox className="w-14 h-6 rounded-lg" />
      </View>
    </View>
  );
};

export const PlanListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <View className="px-4 flex-row flex-wrap">
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className={`w-1/2 p-1.5 ${index % 2 === 0 ? "pl-0 pr-1.5" : "pr-0 pl-1.5"}`} >
          <PlanCardSkeleton />
        </View>
      ))}
    </View>
  );
};