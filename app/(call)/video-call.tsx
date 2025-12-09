import { ConnectingState } from "@/components/call/ConnectingState";
import { VideoConnectedState } from "@/components/call/VideoConnectedState";
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

export default function VideoCall() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<CallParams>();

  const [callState, setCallState] = useState<CallState>("CONNECTING");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isRemoteCameraOff, setIsRemoteCameraOff] = useState(false);

  const { seconds, formatted, start, stop } = useCallTimer();

  const { telecallerId, telecallerName, telecallerProfile } = params;

  useEffect(() => {
    const connectionTimer = setTimeout(() => {
      setCallState("CONNECTED");
      start();
    }, 2000);

    return () => {
      clearTimeout(connectionTimer);
      stop();
    };
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

  const handleToggleCamera = () => {
    setIsCameraOff((prev) => !prev);
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
        callType: "VIDEO",
        role: "USER",
      },
    });
  };

  const isAndroid = Platform.OS === "android";

  return (
    <>
      <StatusBar style="light" />

      {callState === "CONNECTING" ? (
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
            <ConnectingState
              name={telecallerName || "Unknown"}
              profile={telecallerProfile}
              callType="VIDEO"
              onCancel={handleCancel}
            />
          </View>
        </LinearGradient>
      ) : (
        <View className="flex-1 bg-black">
          <VideoConnectedState
            name={telecallerName || "Unknown"}
            profile={telecallerProfile}
            timer={formatted}
            isMuted={isMuted}
            isSpeakerOn={isSpeakerOn}
            isCameraOff={isCameraOff}
            isRemoteCameraOff={isRemoteCameraOff}
            topInset={insets.top}
            bottomInset={isAndroid ? insets.bottom : 0}
            onToggleMute={handleToggleMute}
            onToggleSpeaker={handleToggleSpeaker}
            onToggleCamera={handleToggleCamera}
            onEndCall={handleEndCall}
          />
        </View>
      )}
    </>
  );
}