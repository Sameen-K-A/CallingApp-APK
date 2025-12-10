import { ConnectingState } from "@/components/call/ConnectingState";
import { VideoConnectedState } from "@/components/call/VideoConnectedState";
import { useCallTimer } from "@/hooks/useCallTimer";
import { CallErrorPayload, CallRingingPayload } from "@/socket/types";
import { emitCallInitiate, isUserSocketConnected, onCallError, onCallRinging } from "@/socket/user.socket";
import { showErrorToast } from "@/utils/toast";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
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

  const [callState] = useState<CallState>("CONNECTING");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isRemoteCameraOff] = useState(false);

  const { seconds, formatted, stop } = useCallTimer();
  const { telecallerId, telecallerName, telecallerProfile } = params;

  const callIdRef = useRef<string | null>(null);
  const hasInitiatedRef = useRef(false);

  const isAndroid = Platform.OS === "android";

  useEffect(() => {
    // Prevent double initiation
    if (hasInitiatedRef.current) return;
    hasInitiatedRef.current = true;

    // Check socket connection
    if (!isUserSocketConnected()) {
      showErrorToast("Connection issue. Please restart the application.");
      router.replace("/(app)/(user)/home");
      return;
    }

    // Subscribe to call events
    const unsubscribeRinging = onCallRinging((data: CallRingingPayload) => {
      callIdRef.current = data.callId;
    });

    const unsubscribeError = onCallError((data: CallErrorPayload) => {
      showErrorToast(data.message);
      router.replace("/(app)/(user)/home");
    });

    // Initiate the call
    const success = emitCallInitiate({ telecallerId, callType: "VIDEO", });

    if (!success) {
      showErrorToast("Connection issue. Please restart the application.");
      router.replace("/(app)/(user)/home");
      return;
    }

    return () => {
      unsubscribeRinging();
      unsubscribeError();
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