import { ConnectingState } from "@/components/call/ConnectingState";
import { VideoConnectedState } from "@/components/call/VideoConnectedState";
import { useCallTimer } from "@/hooks/useCallTimer";
import { useLiveKitRoom } from "@/hooks/useLiveKitRoom";
import {
  emitCallEnd as emitTelecallerCallEnd,
  onCallEnded as onTelecallerCallEnded,
} from "@/socket/telecaller.socket";
import {
  CallAcceptedPayload,
  CallRingingPayload,
  LiveKitCredentials,
  MessagePayload,
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
  callId?: string;
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

export default function VideoCall() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams() as CallParams;

  const {
    callId: initialCallId,
    participantId,
    participantName,
    participantProfile,
    role = "USER",
    livekitToken,
    livekitUrl,
    livekitRoomName,
  } = params;

  const isUser = role === "USER";
  const isTelecaller = role === "TELECALLER";
  const isAndroid = Platform.OS === "android";

  // ============================================
  // State Management
  // ============================================

  // USER: Starts as CONNECTING (waiting for call:accepted)
  // TELECALLER: Starts as CONNECTED (already accepted, has token from params)
  const [callState, setCallState] = useState<CallState>(
    isTelecaller ? "CONNECTED" : "CONNECTING"
  );

  // LiveKit credentials
  // TELECALLER: Gets from params immediately
  // USER: Gets from call:accepted event
  const [livekitCredentials, setLivekitCredentials] = useState<LiveKitCredentials | null>(
    isTelecaller && livekitToken && livekitUrl && livekitRoomName
      ? { token: livekitToken, url: livekitUrl, roomName: livekitRoomName }
      : null
  );

  // Timer
  const { seconds, formatted, start, stop } = useCallTimer();

  // LiveKit Room Hook (VIDEO mode)
  const {
    connectionState,
    remoteParticipant,
    localVideoTrack,
    remoteVideoTrack,
    error: livekitError,
    isMuted,
    isSpeakerOn,
    isCameraOff,
    toggleMute,
    toggleSpeaker,
    toggleCamera,
    connect,
    disconnect,
  } = useLiveKitRoom({ callType: 'VIDEO' });

  // Refs
  const callIdRef = useRef<string | null>(initialCallId || null);
  const hasInitiatedRef = useRef(false);
  const hasEndedRef = useRef(false);
  const hasConnectedToLiveKit = useRef(false);

  // ============================================
  // Navigation Helpers
  // ============================================

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
        callType: "VIDEO",
        role,
      },
    });
  };

  const navigateToHome = async () => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    stop();
    await disconnect();

    if (isUser) {
      router.replace("/(app)/(user)/home");
    } else {
      router.replace("/(app)/(telecaller)/dashboard");
    }
  };

  // ============================================
  // Connect to LiveKit when credentials available
  // ============================================

  useEffect(() => {
    if (livekitCredentials && !hasConnectedToLiveKit.current) {
      hasConnectedToLiveKit.current = true;
      console.log("🎥 Connecting to LiveKit (VIDEO):", livekitCredentials.roomName);
      connect(livekitCredentials);
    }
  }, [livekitCredentials, connect]);

  // ============================================
  // Handle LiveKit Errors
  // ============================================

  useEffect(() => {
    if (livekitError) {
      showErrorToast(livekitError);
      navigateToHome();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livekitError]);

  // ============================================
  // Start Timer when Both Parties are Ready
  // ============================================

  useEffect(() => {
    // Timer starts ONLY when:
    // 1. callState === "CONNECTED" (socket confirmed)
    // 2. connectionState === "CONNECTED" (LiveKit connected)
    // 3. remoteParticipant !== null (other party is in room)
    if (
      callState === "CONNECTED" &&
      connectionState === "CONNECTED" &&
      remoteParticipant !== null
    ) {
      console.log("⏱️ Starting timer - both parties connected");
      start();
    }

    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callState, connectionState, remoteParticipant]);

  // ============================================
  // USER: Socket Event Listeners
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

    // Listen for call:ringing - store callId
    const unsubscribeRinging = onCallRinging((data: CallRingingPayload) => {
      console.log("📞 Call ringing, callId:", data.callId);
      callIdRef.current = data.callId;
    });

    // Listen for call:accepted - get LiveKit token
    const unsubscribeAccepted = onCallAccepted((data: CallAcceptedPayload) => {
      console.log("✅ Call accepted, received LiveKit credentials");
      setLivekitCredentials(data.livekit);
      setCallState("CONNECTED");
    });

    // Listen for call:rejected
    const unsubscribeRejected = onCallRejected(() => {
      showErrorToast("Call was declined.");
      navigateToHome();
    });

    // Listen for call:missed (timeout)
    const unsubscribeMissed = onCallMissed(() => {
      showErrorToast("Call was not answered.");
      navigateToHome();
    });

    // Listen for call:error
    const unsubscribeError = onCallError((data: MessagePayload) => {
      showErrorToast(data.message);
      navigateToHome();
    });

    // Listen for call:ended (other party ended)
    const unsubscribeEnded = onCallEnded(() => {
      console.log("📞 Call ended by other party");
      showToast("Call ended");
      navigateToFeedback();
    });

    // Initiate the call
    const success = emitCallInitiate({
      telecallerId: participantId,
      callType: "VIDEO",
    });

    if (!success) {
      showErrorToast("Connection issue. Please restart the application.");
      router.replace("/(app)/(user)/home");
      return;
    }

    console.log("📞 Video call initiated to:", participantId);

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
  // TELECALLER: Socket Event Listeners
  // ============================================

  useEffect(() => {
    if (!isTelecaller) return;

    // Listen for call:ended (user ended the call)
    const unsubscribeEnded = onTelecallerCallEnded(() => {
      console.log("📞 Call ended by other party");
      showToast("Call ended");
      navigateToFeedback();
    });

    return () => {
      unsubscribeEnded();
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTelecaller]);

  // ============================================
  // Action Handlers
  // ============================================

  // USER: Cancel call during CONNECTING state
  const handleCancel = async () => {
    if (hasEndedRef.current) return;

    stop();
    await disconnect();

    if (callIdRef.current) {
      emitCallCancel({ callId: callIdRef.current });
    }

    navigateToHome();
  };

  // Toggle microphone mute
  const handleToggleMute = async () => {
    await toggleMute();
  };

  // Toggle speaker
  const handleToggleSpeaker = () => {
    toggleSpeaker();
  };

  // Toggle camera
  const handleToggleCamera = async () => {
    await toggleCamera();
  };

  // End call (both USER and TELECALLER)
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

    await navigateToFeedback();
  };

  // ============================================
  // Determine if waiting for remote participant
  // ============================================

  const isWaitingForRemote =
    callState === "CONNECTED" &&
    (connectionState !== "CONNECTED" || remoteParticipant === null);

  // Determine if remote camera is off
  const isRemoteCameraOff = remoteParticipant !== null && remoteVideoTrack === null;

  // ============================================
  // Render
  // ============================================

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
              name={participantName || "Unknown"}
              profile={participantProfile}
              callType="VIDEO"
              onCancel={handleCancel}
            />
          </View>
        </LinearGradient>
      ) : (
        <View className="flex-1 bg-black">
          <VideoConnectedState
            name={participantName || "Unknown"}
            profile={participantProfile}
            timer={formatted}
            isWaitingForRemote={isWaitingForRemote}
            isMuted={isMuted}
            isSpeakerOn={isSpeakerOn}
            isCameraOff={isCameraOff}
            isRemoteCameraOff={isRemoteCameraOff}
            localVideoTrack={localVideoTrack}
            remoteVideoTrack={remoteVideoTrack}
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