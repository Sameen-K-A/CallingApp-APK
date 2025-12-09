import { AudioConnectedState } from "@/components/call/AudioConnectedState";
import { ConnectingState } from "@/components/call/ConnectingState";
import { useCallTimer } from "@/hooks/useCallTimer";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CallState = "CONNECTING" | "CONNECTED";

interface CallParams extends Record<string, string | string[]> {
  telecallerId: string;
  telecallerName: string;
  telecallerProfile: string;
}

export default function AudioCall() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<CallParams>();

  const [callState, setCallState] = useState<CallState>("CONNECTING");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  const { seconds, formatted, start, stop } = useCallTimer();
  const { telecallerId, telecallerName, telecallerProfile } = params;
  const isAndroid = Platform.OS === "android";

  useEffect(() => {
    const connectionTimer = setTimeout(() => {
      setCallState("CONNECTED");
      start();
    }, 2000);

    return () => {
      clearTimeout(connectionTimer);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = () => {
    stop();
    router.replace("/(app)/(user)/home");
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn((prev) => !prev);
  };

  const handleEndCall = () => {
    stop();
    router.replace({
      pathname: "/(call)/feedback",
      params: {
        telecallerId,
        telecallerName,
        telecallerProfile: telecallerProfile || "",
        duration: seconds.toString(),
        callType: "AUDIO",
        role: "USER",
      },
    });
  };

  return (
    <>
      <StatusBar style="light" />

      <LinearGradient
        colors={["#000000", "#171717", "#0f0f0f"]}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View
          className="flex-1"
          style={{
            paddingTop: insets.top,
            paddingBottom: isAndroid ? insets.bottom : 0,
          }}
        >
          {callState === "CONNECTING" ? (
            <ConnectingState
              name={telecallerName || "Unknown"}
              profile={telecallerProfile}
              callType="AUDIO"
              onCancel={handleCancel}
            />
          ) : (
            <AudioConnectedState
              name={telecallerName || "Unknown"}
              profile={telecallerProfile}
              timer={formatted}
              isMuted={isMuted}
              isSpeakerOn={isSpeakerOn}
              onToggleMute={handleToggleMute}
              onToggleSpeaker={handleToggleSpeaker}
              onEndCall={handleEndCall}
            />
          )}
        </View>
      </LinearGradient>
    </>
  );
}