import { AudioConnectedState } from "@/components/call/AudioConnectedState";
import { ConnectingState } from "@/components/call/ConnectingState";
import { useCallTimer } from "@/hooks/useCallTimer";
import { useLiveKitRoom } from "@/hooks/useLiveKitRoom";
import {
  emitCallEnd as emitTelecallerCallEnd,
  getTelecallerSocket
} from "@/socket/telecaller.socket";
import {
  CallAcceptedPayload,
  CallRingingPayload,
  LiveKitCredentials,
  MessagePayload
} from "@/socket/types";
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

interface CallParams {
  callId: string;
  participantId: string;
  participantName: string;
  participantProfile: string;
  callType: string;
  role: Role;
  livekitToken?: string;
  livekitUrl?: string;
  livekitRoomName?: string;
  [key: string]: string | string[] | undefined;
}

export default function AudioCall() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams() as CallParams;

  // 1. Initial State Logic:
  // If Telecaller has no token (navigated instantly), start as CONNECTING.
  const [callState, setCallState] = useState<CallState>(
    (params.role === "TELECALLER" && params.livekitToken) ? "CONNECTED" : "CONNECTING"
  );

  const [livekitCredentials, setLivekitCredentials] = useState<LiveKitCredentials | null>(
    params.livekitToken && params.livekitUrl && params.livekitRoomName
      ? {
        token: params.livekitToken,
        url: params.livekitUrl,
        roomName: params.livekitRoomName,
      }
      : null
  );

  const { seconds, formatted, start, stop } = useCallTimer();

  // 2. Use LiveKit Hook
  const {
    connectionState,
    error: livekitError,
    isMuted,
    isSpeakerOn,
    toggleMute,
    toggleSpeaker,
    connect,
    disconnect,
  } = useLiveKitRoom();

  const {
    callId: initialCallId,
    participantId,
    participantName,
    participantProfile,
    role = "USER"
  } = params;

  const callIdRef = useRef<string | null>(initialCallId || null);
  const hasInitiatedRef = useRef(false);
  const hasEndedRef = useRef(false);
  const hasConnectedToLiveKit = useRef(false);

  const isAndroid = Platform.OS === "android";
  const isUser = role === "USER";

  const navigateToFeedback = async () => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    stop();
    await disconnect();

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

  // 3. Connect to LiveKit when credentials arrive
  useEffect(() => {
    if (livekitCredentials && !hasConnectedToLiveKit.current) {
      hasConnectedToLiveKit.current = true;
      console.log('🎧 Connecting to LiveKit:', livekitCredentials.roomName);
      connect(livekitCredentials);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livekitCredentials]); // Removed 'connect' to avoid loop

  // 4. Handle LiveKit errors
  useEffect(() => {
    if (livekitError) {
      showErrorToast(livekitError);
    }
  }, [livekitError]);

  // 5. Start timer when connected
  useEffect(() => {
    if (callState === "CONNECTED" && connectionState === "CONNECTED") {
      start();
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callState, connectionState]);

  // ============================================
  // USER: Setup Socket Listeners
  // ============================================
  useEffect(() => {
    if (!isUser) return;
    if (hasInitiatedRef.current) return;
    hasInitiatedRef.current = true;

    if (!isUserSocketConnected()) {
      showErrorToast("Connection issue. Please restart the application.");
      router.replace("/(app)/(user)/home");
      return;
    }

    const unsubscribeRinging = onCallRinging((data: CallRingingPayload) => {
      callIdRef.current = data.callId;
    });

    const unsubscribeAccepted = onCallAccepted((data: CallAcceptedPayload) => {
      console.log('✅ USER: Call accepted, received LiveKit credentials');
      setLivekitCredentials(data.livekit);
      setCallState("CONNECTED");
    });

    const unsubscribeRejected = onCallRejected((data) => {
      showErrorToast("Call was declined.");
      router.replace("/(app)/(user)/home");
    });

    const unsubscribeMissed = onCallMissed((data) => {
      showErrorToast("Call was not answered.");
      router.replace("/(app)/(user)/home");
    });

    const unsubscribeError = onCallError((data: MessagePayload) => {
      showErrorToast(data.message);
      router.replace("/(app)/(user)/home");
    });

    const unsubscribeEnded = onCallEnded((data) => {
      console.log("📞 Call ended by other party");
      showToast("Call ended");
      navigateToFeedback();
    });

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

  // ============================================
  // TELECALLER: Listen for Token & End Call
  // ============================================
  useEffect(() => {
    if (isUser) return;

    const socket = getTelecallerSocket();
    if (!socket) return;

    // Listen for Token (Call Accepted)
    const handleCallAccepted = (data: any) => {
      console.log('✅ TELECALLER: Received Token via Socket');
      if (data.livekit) {
        setLivekitCredentials(data.livekit);
        setCallState("CONNECTED");
      }
    };

    const handleCallEnded = (data: { callId: string }) => {
      console.log("📞 Call ended by other party");
      showToast("Call ended");
      navigateToFeedback();
    };

    socket.on('call:accepted', handleCallAccepted);
    socket.on('call:ended', handleCallEnded);

    return () => {
      socket.off('call:accepted', handleCallAccepted);
      socket.off('call:ended', handleCallEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUser]);

  const handleCancel = async () => {
    stop();
    await disconnect();

    if (callIdRef.current) {
      emitCallCancel({ callId: callIdRef.current });
    };

    router.replace("/(app)/(user)/home");
  };

  const handleToggleMute = async () => {
    await toggleMute();
  };

  const handleToggleSpeaker = () => {
    toggleSpeaker();
  };

  const handleEndCall = async () => {
    if (hasEndedRef.current) return;

    const callId = callIdRef.current || initialCallId;

    if (callId) {
      if (isUser) {
        emitCallEnd({ callId });
      } else {
        emitTelecallerCallEnd({ callId });
      }
    }

    await disconnect();
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