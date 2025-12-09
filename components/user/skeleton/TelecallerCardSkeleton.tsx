import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

const SkeletonPulse: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
};

export const TelecallerCardSkeleton: React.FC = () => {
  return (
    <SkeletonPulse>
      <View className="bg-card rounded-2xl p-4 mb-2">
        <View className="flex-row items-center">
          <View className="w-16 h-16 rounded-full bg-muted" />

          <View className="flex-1 ml-4">
            <View className="flex-row items-center justify-between mb-2">
              <View className="h-4 w-32 rounded bg-muted" />
              <View className="h-3 w-16 rounded bg-muted" />
            </View>
            <View className="h-3 w-16 rounded bg-muted mb-2" />
            <View className="h-3 w-full rounded bg-muted mb-1" />
            <View className="h-3 w-3/4 rounded bg-muted" />
          </View>

          <View className="ml-3 w-10 h-10 rounded-full bg-muted" />
        </View>
      </View>
    </SkeletonPulse>
  );
};

export const TelecallerListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <View className="px-4">
      {Array.from({ length: count }).map((_, index) => (
        <TelecallerCardSkeleton key={index} />
      ))}
    </View>
  );
};