import { AudioConnectedState } from "@/components/call/AudioConnectedState";
import { ConnectingState } from "@/components/call/ConnectingState";
import { useCallTimer } from "@/hooks/useCallTimer";
import {
  emitCallEnd as emitTelecallerCallEnd,
  getTelecallerSocket
} from "@/socket/telecaller.socket";
import { CallErrorPayload, CallRingingPayload } from "@/socket/types";
import {
  emitCallCancel,
  emitCallEnd,
  emitCallInitiate,
  isUserSocketConnected,
  onCallAccepted,
  onCallEnded,
  onCallError,
  onCallMissed,
  onCallRejected,
  onCallRinging,
} from "@/socket/user.socket";
import { showErrorToast, showToast } from "@/utils/toast";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CallState = "CONNECTING" | "CONNECTED";
type Role = "USER" | "TELECALLER";

interface CallParams extends Record<string, string | string[]> {
  callId: string;
  participantId: string;
  participantName: string;
  participantProfile: string;
  callType: string;
  role: Role;
}

export default function AudioCall() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<CallParams>();

  const [callState, setCallState] = useState<CallState>(params.role === "TELECALLER" ? "CONNECTED" : "CONNECTING");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  const { seconds, formatted, start, stop } = useCallTimer();
  const {
    callId: initialCallId,
    participantId,
    participantName,
    participantProfile,
    role = "USER"
  } = params;

  const callIdRef = useRef<string | null>(null);
  const hasInitiatedRef = useRef(false);
  const hasEndedRef = useRef(false);

  const isAndroid = Platform.OS === "android";
  const isUser = role === "USER";

  const navigateToFeedback = () => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    stop();

    router.replace({
      pathname: "/(app)/(call)/feedback",
      params: {
        callId: callIdRef.current || initialCallId || "",
        participantId,
        participantName,
        participantProfile: participantProfile || "",
        duration: seconds.toString(),
        callType: "AUDIO",
        role,
      },
    });
  };

  // Start timer immediately for telecaller (they're already connected)
  useEffect(() => {
    if (!isUser && callState === "CONNECTED") {
      start();
    }

    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Prevent double initiation
    if (!isUser) return;
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

    const unsubscribeAccepted = onCallAccepted((data) => {
      setCallState("CONNECTED");
      start();
    });

    const unsubscribeRejected = onCallRejected((data) => {
      showErrorToast("Call was declined.");
      router.replace("/(app)/(user)/home");
    });

    const unsubscribeMissed = onCallMissed((data) => {
      showErrorToast("Call was not answered.");
      router.replace("/(app)/(user)/home");
    });

    const unsubscribeError = onCallError((data: CallErrorPayload) => {
      showErrorToast(data.message);
      router.replace("/(app)/(user)/home");
    });

    const unsubscribeEnded = onCallEnded((data) => {
      console.log("📞 Call ended by other party:", data);
      showToast("Call ended");
      navigateToFeedback();
    });

    // Initiate the call
    const success = emitCallInitiate({ telecallerId: participantId, callType: "AUDIO" });

    if (!success) {
      showErrorToast("Connection issue. Please restart the application.");
      router.replace("/(app)/(user)/home");
      return;
    }

    return () => {
      unsubscribeRinging();
      unsubscribeAccepted();
      unsubscribeRejected();
      unsubscribeMissed();
      unsubscribeEnded();
      unsubscribeError();
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Telecaller: Listen for call ended by user
  useEffect(() => {
    if (isUser) return;

    const socket = getTelecallerSocket();
    if (!socket) return;

    const handleCallEnded = (data: { callId: string }) => {
      console.log("📞 Call ended by other party:", data);
      showToast("Call ended");
      navigateToFeedback();
    };

    socket.on('call:ended', handleCallEnded);

    return () => {
      socket.off('call:ended', handleCallEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUser]);

  const handleCancel = () => {
    stop();

    if (callIdRef.current) {
      emitCallCancel({ callId: callIdRef.current });
    };

    router.replace("/(app)/(user)/home");
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn((prev) => !prev);
  };

  const handleEndCall = () => {
    if (hasEndedRef.current) return;

    const callId = callIdRef.current || initialCallId;

    if (callId) {
      if (isUser) {
        emitCallEnd({ callId });
      } else {
        emitTelecallerCallEnd({ callId });
      }
    }

    navigateToFeedback();
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
              name={participantName || "Unknown"}
              profile={participantProfile}
              callType="AUDIO"
              onCancel={handleCancel}
            />
          ) : (
            <AudioConnectedState
              name={participantName || "Unknown"}
              profile={participantProfile}
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