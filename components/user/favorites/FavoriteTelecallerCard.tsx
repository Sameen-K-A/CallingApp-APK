import { Avatar } from "@/components/shared/avatars";
import { TelecallerListItem } from "@/types/user";
import { getInitials } from "@/utils/formatter";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

const BUTTON_WIDTH = 80;
const GAP = 10;
const SLIDE_DISTANCE = BUTTON_WIDTH + GAP;
const SWIPE_THRESHOLD = 40;

const TIMING_CONFIG = {
  duration: 200,
};

interface FavoriteTelecallerCardProps {
  telecaller: TelecallerListItem;
  onRemove: (telecaller: TelecallerListItem) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const FavoriteTelecallerCard: React.FC<FavoriteTelecallerCardProps> = ({ telecaller, onRemove, isOpen, onOpen, onClose }) => {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (!isOpen && translateX.value < 0) {
      translateX.value = withTiming(0, TIMING_CONFIG);
    }
  }, [isOpen]);

  const openCard = useCallback(() => {
    translateX.value = withTiming(-SLIDE_DISTANCE, TIMING_CONFIG);
    onOpen();
  }, [onOpen]);

  const closeCard = useCallback(() => {
    translateX.value = withTiming(0, TIMING_CONFIG);
    onClose();
  }, [onClose]);

  const showHintBounce = useCallback(() => {
    translateX.value = withSequence(
      withTiming(-50, { duration: 150 }),
      withTiming(0, { duration: 150 })
    );
  }, []);

  const handleTap = useCallback(() => {
    if (translateX.value < -10) {
      closeCard();
    } else {
      showHintBounce();
    }
  }, [closeCard, showHintBounce]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15])
    .onUpdate((event) => {
      if (isOpen) {
        const newValue = -SLIDE_DISTANCE + event.translationX;
        translateX.value = Math.max(Math.min(newValue, 0), -SLIDE_DISTANCE);
      } else {
        if (event.translationX < 0) {
          translateX.value = Math.max(event.translationX, -SLIDE_DISTANCE);
        }
      }
    })
    .onEnd((event) => {
      const velocity = event.velocityX;
      const translation = event.translationX;

      if (isOpen) {
        if (translation > SWIPE_THRESHOLD || velocity > 500) {
          runOnJS(closeCard)();
        } else {
          translateX.value = withTiming(-SLIDE_DISTANCE, TIMING_CONFIG);
        }
      } else {
        if (translation < -SWIPE_THRESHOLD || velocity < -500) {
          runOnJS(openCard)();
        } else {
          translateX.value = withTiming(0, TIMING_CONFIG);
        }
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handleTap)();
  });

  const composedGesture = Gesture.Exclusive(panGesture, tapGesture);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedButtonStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SLIDE_DISTANCE, -20, 0],
      [1, 0.5, 0]
    );

    const scale = interpolate(
      translateX.value,
      [-SLIDE_DISTANCE, -20, 0],
      [1, 0.8, 0.8]
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const getPresenceColor = () => {
    switch (telecaller.presence) {
      case "ONLINE":
        return "bg-success";
      case "ON_CALL":
        return "bg-warning";
      case "OFFLINE":
        return "bg-destructive";
      default:
        return "bg-destructive";
    }
  };

  const getPresenceText = () => {
    switch (telecaller.presence) {
      case "ONLINE":
        return "Online";
      case "ON_CALL":
        return "On Call";
      case "OFFLINE":
        return "Offline";
      default:
        return "Offline";
    }
  };

  return (
    <View className="mb-2">
      <Animated.View
        className="absolute top-0 bottom-0 rounded-2xl overflow-hidden right-0"
        style={[{ width: BUTTON_WIDTH }, animatedButtonStyle,]}
      >
        <TouchableOpacity
          className="flex-1 bg-destructive items-center justify-center"
          onPress={() => onRemove(telecaller)}
          activeOpacity={0.8}
        >
          <Ionicons name="heart-dislike" size={22} color="#FFFFFF" />
          <Text
            allowFontScaling={false}
            className="text-xs font-medium text-white mt-1"
          >
            Remove
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <GestureDetector gesture={composedGesture}>
        <Animated.View
          className="bg-card rounded-2xl p-4 border border-muted"
          style={animatedCardStyle}
        >
          <View className="flex-row items-center">
            <View className="relative">
              <View className="w-16 h-16 rounded-full bg-muted border-2 border-primary/20 items-center justify-center overflow-hidden">
                {telecaller.profile?.startsWith("avatar-") ? (
                  <Avatar avatarId={telecaller.profile} size={60} />
                ) : (
                  <Text
                    className="text-xl font-semibold text-primary"
                    allowFontScaling={false}
                  >
                    {getInitials(telecaller.name)}
                  </Text>
                )}
              </View>

              <View className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-card items-center justify-center ${getPresenceColor()}`} >
                <View className="w-2 h-2 rounded-full bg-white" />
              </View>
            </View>

            <View className="flex-1 ml-4">
              <View className="flex-row items-center justify-between mb-1">
                <Text
                  allowFontScaling={false}
                  className="text-base font-semibold text-text flex-1"
                  numberOfLines={1}
                >
                  {telecaller.name}
                </Text>

                <View
                  className={`ml-2 px-2 py-0.5 rounded-full ${telecaller.presence === "ONLINE"
                    ? "bg-success/10"
                    : telecaller.presence === "ON_CALL"
                      ? "bg-warning/10"
                      : "bg-muted"
                    }`}
                >
                  <Text
                    allowFontScaling={false}
                    className={`text-xs font-medium ${telecaller.presence === "ONLINE"
                      ? "text-success"
                      : telecaller.presence === "ON_CALL"
                        ? "text-warning"
                        : "text-textMuted"
                      }`}
                  >
                    {getPresenceText()}
                  </Text>
                </View>
              </View>

              {telecaller.language && (
                <View className="flex-row mb-1.5">
                  <View className="flex-row items-center px-2 py-0.5 bg-secondary rounded-full">
                    <Ionicons name="language-outline" size={12} color="#5B21B6" />
                    <Text
                      allowFontScaling={false}
                      className="text-xs font-medium text-secondaryForeground ml-1"
                    >
                      {telecaller.language}
                    </Text>
                  </View>
                </View>
              )}

              <Text
                allowFontScaling={false}
                className="text-sm text-textMuted leading-5"
                numberOfLines={2}
              >
                {telecaller.about}
              </Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};