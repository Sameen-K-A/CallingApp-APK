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
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

type CallState = "CONNECTING" | "CONNECTED";
type Role = "USER" | "TELECALLER";
type CallType = "AUDIO" | "VIDEO";

export interface UseActiveCallProps {
  initialCallId?: string;
  participantId: string;
  callType: CallType;
  role: Role;
  initialLiveKitCredentials?: LiveKitCredentials | null;
}

export function useActiveCall({
  initialCallId,
  participantId,
  callType,
  role,
  initialLiveKitCredentials,
}: UseActiveCallProps) {
  const router = useRouter();

  // ============================================
  // State
  // ============================================
  const [callState, setCallState] = useState<CallState>(
    role === "TELECALLER" ? "CONNECTED" : "CONNECTING"
  );

  const [livekitCredentials, setLivekitCredentials] = useState<LiveKitCredentials | null>(
    initialLiveKitCredentials || null
  );

  const [isEnding, setIsEnding] = useState(false);

  // ============================================
  // Hooks & Refs
  // ============================================
  const { seconds, formatted, start, stop } = useCallTimer();

  const liveKit = useLiveKitRoom({ callType });
  const {
    connectionState,
    remoteParticipant,
    error: liveKitError,
    connect,
    disconnect
  } = liveKit;

  const callIdRef = useRef<string | null>(initialCallId || null);
  const hasInitiatedRef = useRef(false);
  const hasConnectedRef = useRef(false);

  // ============================================
  // Helper: Navigation
  // ============================================
  const navigateAway = (destination: 'feedback' | 'home') => {
    stop();
    disconnect();

    if (destination === 'feedback') {
      router.replace({
        pathname: "/(app)/(call)/feedback",
        params: {
          callId: callIdRef.current || "",
          participantId,
          duration: seconds.toString(),
          callType,
          role,
        },
      });
    } else {
      if (role === "USER") {
        router.replace("/(app)/(user)/home");
      } else {
        router.replace("/(app)/(telecaller)/dashboard");
      }
    }
  };

  const handleEndCall = () => {
    if (isEnding) return;
    setIsEnding(true);

    const callId = callIdRef.current;
    if (callId) {
      if (role === "USER") {
        emitCallEnd({ callId });
      } else {
        emitTelecallerCallEnd({ callId });
      }
    }

    navigateAway('feedback');
  };

  const handleCancelCall = () => {
    if (isEnding) return;
    setIsEnding(true);

    if (callIdRef.current) {
      emitCallCancel({ callId: callIdRef.current });
    }
    navigateAway('home');
  };

  // ============================================
  // Side Effect: LiveKit Connection
  // ============================================
  useEffect(() => {
    if (livekitCredentials && !hasConnectedRef.current) {
      hasConnectedRef.current = true;
      connect(livekitCredentials);
    }
  }, [livekitCredentials, connect]);

  useEffect(() => {
    if (liveKitError) {
      showErrorToast(liveKitError);
      navigateAway('home');
    }
  }, [liveKitError]);

  // ============================================
  // Side Effect: Timer Logic
  // ============================================
  useEffect(() => {
    if (
      !isEnding &&
      callState === "CONNECTED" &&
      connectionState === "CONNECTED" &&
      remoteParticipant !== null
    ) {
      start();
    }
    return () => stop();
  }, [callState, connectionState, remoteParticipant, isEnding]);

  // ============================================
  // Side Effect: Socket Listeners (USER)
  // ============================================
  useEffect(() => {
    if (role !== "USER") return;
    if (hasInitiatedRef.current) return;
    hasInitiatedRef.current = true;

    if (!isUserSocketConnected()) {
      showErrorToast("Connection lost. Please restart.");
      navigateAway('home');
      return;
    }

    // Call Initiate
    const success = emitCallInitiate({ telecallerId: participantId, callType });
    if (!success) {
      showErrorToast("Connection lost. Please restart.");
      navigateAway('home');
      return;
    }

    // Listeners
    const unsubRinging = onCallRinging((data: CallRingingPayload) => {
      callIdRef.current = data.callId;
    });

    const unsubAccepted = onCallAccepted((data: CallAcceptedPayload) => {
      setLivekitCredentials(data.livekit);
      setCallState("CONNECTED");
    });

    const unsubRejected = onCallRejected(() => {
      showErrorToast("Call declined");
      navigateAway('home');
    });

    const unsubMissed = onCallMissed(() => {
      showErrorToast("No answer");
      navigateAway('home');
    });

    const unsubError = onCallError((data: MessagePayload) => {
      showErrorToast(data.message);
      navigateAway('home');
    });

    const unsubEnded = onCallEnded(() => {
      if (!isEnding) {
        setIsEnding(true);
        showToast("Call ended");
        navigateAway('feedback');
      }
    });

    return () => {
      unsubRinging();
      unsubAccepted();
      unsubRejected();
      unsubMissed();
      unsubError();
      unsubEnded();
      stop();
    };
  }, []);

  // ============================================
  // Side Effect: Socket Listeners (TELECALLER)
  // ============================================
  useEffect(() => {
    if (role !== "TELECALLER") return;

    const unsubEnded = onTelecallerCallEnded(() => {
      if (!isEnding) {
        setIsEnding(true);
        showToast("Call ended");
        navigateAway('feedback');
      }
    });

    return () => {
      unsubEnded();
      stop();
    };
  }, []);

  return {
    callState,
    isEnding,
    formattedTime: formatted,
    timerSeconds: seconds,
    liveKit,
    handleEndCall,
    handleCancelCall,
  };
}