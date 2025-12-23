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
import { BackHandler } from "react-native";

type CallState = "IDLE" | "CONNECTING" | "CONNECTED";
type Role = "USER" | "TELECALLER";
type CallType = "AUDIO" | "VIDEO";

export interface UseActiveCallProps {
  initialCallId?: string;
  participantId: string;
  callType: CallType;
  role: Role;
  initialLiveKitCredentials?: LiveKitCredentials | null;
}

export interface UseActiveCallReturn {
  callState: CallState;
  isEnding: boolean;
  livekitCredentials: LiveKitCredentials | null;
  callId: string | null;
  handleEndCall: () => void;
  handleCancelCall: () => void;
}

export function useActiveCall({
  initialCallId,
  participantId,
  callType,
  role,
  initialLiveKitCredentials,
}: UseActiveCallProps): UseActiveCallReturn {
  const router = useRouter();

  // ============================================
  // State
  // ============================================
  const [callState, setCallState] = useState<CallState>(
    role === "TELECALLER" && initialLiveKitCredentials ? "CONNECTED" : "IDLE"
  );

  const [livekitCredentials, setLivekitCredentials] = useState<LiveKitCredentials | null>(
    initialLiveKitCredentials || null
  );

  const [isEnding, setIsEnding] = useState(false);

  // ============================================
  // Refs
  // ============================================
  const isEndingRef = useRef(false);
  const callIdRef = useRef<string | null>(initialCallId || null);
  const hasInitiatedRef = useRef(false);
  const hasConnectedRef = useRef(false);
  const isNavigatingRef = useRef(false);

  // ============================================
  // Helper: Navigation & Cleanup
  // ============================================
  const navigateAway = (destination: 'feedback' | 'home') => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    if (destination === 'feedback') {
      router.replace({
        pathname: "/(app)/(call)/feedback",
        params: {
          callId: callIdRef.current || "",
          participantId,
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
    if (isEndingRef.current) return;
    isEndingRef.current = true;
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
    if (isEndingRef.current) return;
    isEndingRef.current = true;
    setIsEnding(true);

    if (callIdRef.current) {
      emitCallCancel({ callId: callIdRef.current });
    }
    navigateAway('home');
  };

  // ============================================
  // Android Back Button Handler
  // ============================================
  useEffect(() => {
    const backAction = () => {
      if (callState === "CONNECTED") {
        handleEndCall();
      } else {
        handleCancelCall();
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [callState]);

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

    setCallState("CONNECTING");

    const success = emitCallInitiate({ telecallerId: participantId, callType });
    if (!success) {
      showErrorToast("Connection lost. Please restart.");
      navigateAway('home');
      return;
    }

    const unsubRinging = onCallRinging((data: CallRingingPayload) => {
      callIdRef.current = data.callId;
    });

    const unsubAccepted = onCallAccepted((data: CallAcceptedPayload) => {
      if (hasConnectedRef.current) return;

      hasConnectedRef.current = true;
      callIdRef.current = data.callId;
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
      if (!isEndingRef.current) {
        isEndingRef.current = true;
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
    };
  }, []);

  // ============================================
  // Side Effect: Socket Listeners (TELECALLER)
  // ============================================
  useEffect(() => {
    if (role !== "TELECALLER") return;

    const unsubEnded = onTelecallerCallEnded(() => {
      if (!isEndingRef.current) {
        isEndingRef.current = true;
        setIsEnding(true);
        showToast("Call ended");
        navigateAway('feedback');
      }
    });

    return () => {
      unsubEnded();
    };
  }, []);

  return {
    callState,
    isEnding,
    livekitCredentials,
    callId: callIdRef.current,
    handleEndCall,
    handleCancelCall,
  };
}