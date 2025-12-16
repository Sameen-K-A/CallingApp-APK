import { AudioConnectedState } from "@/components/call/AudioConnectedState";
import { ConnectingState } from "@/components/call/ConnectingState";
import { useCallTimer } from "@/hooks/useCallTimer";
import { useLiveKitRoom } from "@/hooks/useLiveKitRoom";
import {
  clearPendingCallAccepted,
  emitCallEnd as emitTelecallerCallEnd,
  getPendingCallAccepted,
  getTelecallerSocket
} from "@/socket/telecaller.socket";
import {
  CallAcceptedPayload,
  CallRingingPayload,
  LiveKitCredentials,
  MessagePayload,
  TelecallerCallAcceptedPayload
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
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  [key: string]: string | string[] | undefined;
}

export default function AudioCall() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams() as CallParams;

  const [callState, setCallState] = useState<CallState>("CONNECTING");
  const [livekitCredentials, setLivekitCredentials] = useState<LiveKitCredentials | null>(null);

  const { seconds, formatted, start, stop } = useCallTimer();

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
  const tokenCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef<number>(0);

  // Keep secondsRef in sync with seconds (for use in callbacks)
  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  const isAndroid = Platform.OS === "android";
  const isUser = role === "USER";

  // ============================================
  // Process LiveKit Credentials (shared logic)
  // ============================================
  const processLiveKitCredentials = useCallback((credentials: LiveKitCredentials) => {
    console.log('🎧 Processing LiveKit credentials for room:', credentials.roomName);
    setLivekitCredentials(credentials);
    setCallState("CONNECTED");
  }, []);

  // ============================================
  // Navigate to Feedback Screen
  // ============================================
  const navigateToFeedback = useCallback(async () => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
      tokenCheckIntervalRef.current = null;
    }

    stop();
    await disconnect();

    if (!isUser && callIdRef.current) {
      clearPendingCallAccepted(callIdRef.current);
    }

    router.replace({
      pathname: "/(app)/(call)/feedback",
      params: {
        callId: callIdRef.current || initialCallId || "",
        participantId,
        participantName,
        participantProfile: participantProfile || "",
        duration: secondsRef.current.toString(),
        callType: "AUDIO",
        role,
      },
    });
  }, [disconnect, stop, router, initialCallId, participantId, participantName, participantProfile, role, isUser]);

  // ============================================
  // Connect to LiveKit when credentials arrive
  // ============================================
  useEffect(() => {
    if (livekitCredentials && !hasConnectedToLiveKit.current) {
      hasConnectedToLiveKit.current = true;
      console.log('🎧 Connecting to LiveKit:', livekitCredentials.roomName);
      connect(livekitCredentials);
    }
  }, [livekitCredentials, connect]);

  // ============================================
  // Handle LiveKit errors
  // ============================================
  useEffect(() => {
    if (livekitError) {
      showErrorToast(livekitError);
    }
  }, [livekitError]);

  // ============================================
  // Start timer when fully connected
  // ============================================
  useEffect(() => {
    if (callState === "CONNECTED" && connectionState === "CONNECTED") {
      start();
    }
  }, [callState, connectionState, start]);

  // ============================================
  // USER SIDE: Setup Socket Listeners & Initiate Call
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
      console.log('📞 USER: Call ringing, callId:', data.callId);
      callIdRef.current = data.callId;
    });

    const unsubscribeAccepted = onCallAccepted((data: CallAcceptedPayload) => {
      console.log('✅ USER: Call accepted, received LiveKit credentials');
      processLiveKitCredentials(data.livekit);
    });

    const unsubscribeRejected = onCallRejected(() => {
      showErrorToast("Call was declined.");
      router.replace("/(app)/(user)/home");
    });

    const unsubscribeMissed = onCallMissed(() => {
      showErrorToast("Call was not answered.");
      router.replace("/(app)/(user)/home");
    });

    const unsubscribeError = onCallError((data: MessagePayload) => {
      showErrorToast(data.message);
      router.replace("/(app)/(user)/home");
    });

    const unsubscribeEnded = onCallEnded(() => {
      console.log("📞 USER: Call ended by other party");
      showToast("Call ended");
      navigateToFeedback();
    });

    const success = emitCallInitiate({ telecallerId: participantId, callType: "AUDIO" });

    if (!success) {
      showErrorToast("Connection issue. Please restart the application.");
      router.replace("/(app)/(user)/home");
      return;
    }

    console.log('📞 USER: Call initiated to telecaller:', participantId);

    return () => {
      unsubscribeRinging();
      unsubscribeAccepted();
      unsubscribeRejected();
      unsubscribeMissed();
      unsubscribeEnded();
      unsubscribeError();
    };
  }, [isUser, participantId, router, processLiveKitCredentials, navigateToFeedback]);

  // ============================================
  // TELECALLER SIDE: Check for Pending Token & Listen for Events
  // ============================================
  useEffect(() => {
    if (isUser) return;

    const callId = initialCallId;
    if (!callId) {
      console.log('❌ TELECALLER: No callId provided');
      showErrorToast("Invalid call. Please try again.");
      router.replace("/(app)/(telecaller)/dashboard");
      return;
    }

    console.log('📞 TELECALLER: Checking for pending token, callId:', callId);

    const checkForPendingToken = (): boolean => {
      const pendingData = getPendingCallAccepted(callId);
      if (pendingData && pendingData.livekit) {
        console.log('✅ TELECALLER: Found pending token!');
        processLiveKitCredentials(pendingData.livekit);
        clearPendingCallAccepted(callId);
        return true;
      }
      return false;
    };

    if (checkForPendingToken()) {
      return;
    }

    console.log('📞 TELECALLER: No pending token yet, setting up polling and listener');

    let pollCount = 0;
    const maxPolls = 50;

    tokenCheckIntervalRef.current = setInterval(() => {
      pollCount++;

      if (checkForPendingToken()) {
        if (tokenCheckIntervalRef.current) {
          clearInterval(tokenCheckIntervalRef.current);
          tokenCheckIntervalRef.current = null;
        }
        return;
      }

      if (pollCount >= maxPolls) {
        if (tokenCheckIntervalRef.current) {
          clearInterval(tokenCheckIntervalRef.current);
          tokenCheckIntervalRef.current = null;
        }
        console.log('📞 TELECALLER: Polling stopped, relying on socket listener');
      }
    }, 100);

    const socket = getTelecallerSocket();
    if (!socket) {
      showErrorToast("Connection lost. Please try again.");
      router.replace("/(app)/(telecaller)/dashboard");
      return;
    }

    const handleCallAccepted = (data: TelecallerCallAcceptedPayload) => {
      if (data.callId !== callId) return;

      console.log('✅ TELECALLER: Received call:accepted via listener');

      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
        tokenCheckIntervalRef.current = null;
      }

      if (data.livekit) {
        processLiveKitCredentials(data.livekit);
        clearPendingCallAccepted(callId);
      }
    };

    const handleCallEnded = (data: { callId: string }) => {
      if (data.callId !== callId) return;

      console.log("📞 TELECALLER: Call ended by other party");
      showToast("Call ended");
      navigateToFeedback();
    };

    socket.on('call:accepted', handleCallAccepted);
    socket.on('call:ended', handleCallEnded);

    return () => {
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
        tokenCheckIntervalRef.current = null;
      }
      socket.off('call:accepted', handleCallAccepted);
      socket.off('call:ended', handleCallEnded);
    };
  }, [isUser, initialCallId, router, processLiveKitCredentials, navigateToFeedback]);

  // ============================================
  // Handle Cancel (User only, during CONNECTING)
  // ============================================
  const handleCancel = async () => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
      tokenCheckIntervalRef.current = null;
    }

    stop();
    await disconnect();

    if (callIdRef.current) {
      emitCallCancel({ callId: callIdRef.current });
    }

    router.replace("/(app)/(user)/home");
  };

  // ============================================
  // Handle Mute Toggle
  // ============================================
  const handleToggleMute = async () => {
    await toggleMute();
  };

  // ============================================
  // Handle Speaker Toggle
  // ============================================
  const handleToggleSpeaker = () => {
    toggleSpeaker();
  };

  // ============================================
  // Handle End Call
  // ============================================
  const handleEndCall = async () => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
      tokenCheckIntervalRef.current = null;
    }

    const callId = callIdRef.current || initialCallId;

    if (callId) {
      if (isUser) {
        emitCallEnd({ callId });
      } else {
        emitTelecallerCallEnd({ callId });
      }
    }

    await disconnect();

    if (!isUser && callId) {
      clearPendingCallAccepted(callId);
    }

    stop();
    router.replace({
      pathname: "/(app)/(call)/feedback",
      params: {
        callId: callId || "",
        participantId,
        participantName,
        participantProfile: participantProfile || "",
        duration: secondsRef.current.toString(),
        callType: "AUDIO",
        role,
      },
    });
  };

  // ============================================
  // Render
  // ============================================
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