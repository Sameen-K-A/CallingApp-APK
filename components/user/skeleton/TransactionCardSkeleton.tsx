import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

const SkeletonBox: React.FC<{ className?: string }> = ({ className }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 800 }), -1, true);
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

const TransactionCardSkeleton: React.FC = () => {
  return (
    <View className="bg-card rounded-2xl p-4 mb-2 border border-border/50">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <SkeletonBox className="w-10 h-10 rounded-xl" />
          <View className="ml-3">
            <SkeletonBox className="w-16 h-4 rounded mb-1.5" />
            <SkeletonBox className="w-24 h-3 rounded" />
          </View>
        </View>

        <SkeletonBox className="w-16 h-6 rounded-full" />
      </View>

      <View className="flex-row items-center justify-between pt-3 border-t border-border/50">
        <SkeletonBox className="w-20 h-4 rounded" />
        <SkeletonBox className="w-14 h-5 rounded" />
      </View>
    </View>
  );
};

export const TransactionListSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <View className="px-4 pt-4">
      {Array.from({ length: count }).map((_, index) => (
        <TransactionCardSkeleton key={index} />
      ))}
    </View>
  );
};