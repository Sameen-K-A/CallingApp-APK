import { Avatar } from '@/components/shared/avatars';
import { TelecallerCallInformationPayload } from '@/socket/types';
import { getInitials } from '@/utils/formatter';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Text, TouchableOpacity, Vibration, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface IncomingCallOverlayProps {
  callData: TelecallerCallInformationPayload;
  onAccept: () => void;
  onReject: () => void;
}

const PulsingRing = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1000, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 1000, easing: Easing.out(Easing.ease) }),
        withTiming(0.6, { duration: 1000, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="absolute w-44 h-44 rounded-full border-4 border-green-400"
    />
  );
};

const SecondPulsingRing = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 1200, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1200, easing: Easing.out(Easing.ease) }),
        withTiming(0.4, { duration: 1200, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="absolute w-52 h-52 rounded-full border-2 border-green-400"
    />
  );
};

const RingingIndicator = () => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

export const IncomingCallOverlay: React.FC<IncomingCallOverlayProps> = ({ callData, onAccept, onReject }) => {
  const insets = useSafeAreaInsets();
  const { caller, callType } = callData;

  useEffect(() => {
    // Start vibration pattern for incoming call
    const pattern = [0, 500, 200, 500, 200, 500];
    Vibration.vibrate(pattern, true);

    return () => {
      Vibration.cancel();
    };
  }, []);

  const handleAccept = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Vibration.cancel();
    onAccept();
  };

  const handleReject = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Vibration.cancel();
    onReject();
  };

  return (
    <View className="absolute inset-0 z-50">
      <LinearGradient
        colors={['#000000', '#0a0a0a', '#111111']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View
          className="flex-1"
          style={{
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
          <View className="items-center pt-8">
            <View className="flex-row items-center">
              <RingingIndicator />
              <Text
                allowFontScaling={false}
                className="text-green-400 text-sm font-semibold tracking-wide"
              >
                INCOMING CALL
              </Text>
            </View>
          </View>

          <View className="flex-1 items-center justify-center">
            <View className="items-center justify-center mb-10">
              <SecondPulsingRing />
              <PulsingRing />

              <View className="w-36 h-36 rounded-full bg-white/5 border-2 border-white/20 items-center justify-center overflow-hidden">
                {caller.profile?.startsWith('avatar-') ? (
                  <Avatar avatarId={caller.profile} size={130} />
                ) : (
                  <Text
                    allowFontScaling={false}
                    className="text-5xl font-bold text-white"
                  >
                    {getInitials(caller.name)}
                  </Text>
                )}
              </View>
            </View>

            <Text
              allowFontScaling={false}
              numberOfLines={1}
              className="text-3xl font-bold text-white mb-3 mt-5"
            >
              {caller.name}
            </Text>

            <View className="flex-row items-center bg-white/10 px-4 py-2 rounded-full">
              <Ionicons
                name={callType === 'VIDEO' ? 'videocam' : 'call'}
                size={16}
                color="#FFFFFF"
              />
              <Text
                allowFontScaling={false}
                className="text-white/70 text-sm font-medium ml-2"
              >
                {callType === 'VIDEO' ? 'Incoming Video Call' : 'Incoming Voice Call'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-center gap-16 pb-16">
            <View className="items-center">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleReject}
                className="w-16 h-16 rounded-full bg-red-500 items-center justify-center mb-2"
              >
                <Ionicons name="call" size={28} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>
              <Text
                allowFontScaling={false}
                className="text-white/70 text-sm font-medium"
              >
                Decline
              </Text>
            </View>

            <View className="items-center">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleAccept}
                className="w-16 h-16 rounded-full bg-green-500 items-center justify-center mb-2"
              >
                <Ionicons
                  name={callType === 'VIDEO' ? 'videocam' : 'call'}
                  size={28}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <Text
                allowFontScaling={false}
                className="text-white/70 text-sm font-medium"
              >
                Accept
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};