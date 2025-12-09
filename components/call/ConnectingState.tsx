import { Avatar } from "@/components/shared/avatars";
import { getInitials } from "@/utils/formatter";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

interface ConnectingStateProps {
  name: string;
  profile?: string;
  callType: "AUDIO" | "VIDEO";
  onCancel: () => void;
}

const RotatingRing = () => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 3000, easing: Easing.linear }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="absolute w-[190px] h-[190px] rounded-full border-4 border-transparent border-t-primary border-r-primaryLight"
    />
  );
};

const StatusDot = () => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="w-3 h-3 rounded-full bg-green-400 mr-2"
    />
  );
};

export const ConnectingState: React.FC<ConnectingStateProps> = ({
  name,
  profile,
  callType,
  onCancel,
}) => {
  return (
    <View className="flex-1">
      <View className="items-center pt-8">
        <View className="flex-row items-center">
          <StatusDot />
          <Text
            allowFontScaling={false}
            className="text-green-400 text-sm font-semibold tracking-wide"
          >
            CONNECTING
          </Text>
        </View>
      </View>

      <View className="flex-1 items-center justify-center">
        <View className="items-center justify-center mb-10">
          <RotatingRing />
          <View className="absolute w-44 h-44 rounded-full border border-white/10" />

          <View className="w-36 h-36 rounded-full bg-white/5 border-2 border-white/20 items-center justify-center overflow-hidden">
            {profile?.startsWith("avatar-") ? (
              <Avatar avatarId={profile} size={130} />
            ) : (
              <Text
                allowFontScaling={false}
                className="text-5xl font-bold text-white"
              >
                {getInitials(name)}
              </Text>
            )}
          </View>
        </View>

        <Text
          allowFontScaling={false}
          numberOfLines={1}
          className="text-3xl font-nexaHeavy font-bold text-white mb-3 mt-5"
        >
          {name}
        </Text>

        <View className="flex-row items-center bg-white/10 px-4 py-2 rounded-full">
          <Ionicons
            name={callType === "VIDEO" ? "videocam" : "call"}
            size={16}
            color="#FFFFFF"
          />
          <Text
            allowFontScaling={false}
            className="text-white/70 text-sm font-medium ml-2"
          >
            {callType === "VIDEO" ? "Video Call" : "Voice Call"}
          </Text>
        </View>
      </View>

      <View className="items-center pb-10">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onCancel}
          className="w-14 h-14 rounded-full bg-red-500/80 items-center justify-center"
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};