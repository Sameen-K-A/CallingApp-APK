import { IncomingCallOverlay } from "@/components/call/IncomingCallOverlay";
import { Loading } from "@/components/shared/Loading";
import { Header } from "@/components/telecaller/Header";
import { TabBar } from "@/components/telecaller/TabBar";
import { useAuth } from "@/context/AuthContext";
import {
  emitCallAccept,
  emitCallEnd,
  emitCallReject,
  getTelecallerSocket,
  isTelecallerSocketConnected,
  setOnSocketReady
} from "@/socket/telecaller.socket";
import {
  CallIdPayload,
  TelecallerCallAcceptedPayload,
  TelecallerCallInformationPayload
} from "@/socket/types";
import { checkCallPermissions } from "@/utils/permission";
import { showErrorToast, showToast } from "@/utils/toast";
import { Redirect, router, Slot, usePathname } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";

type OverlayState = 'RINGING' | 'CONNECTING';

interface IncomingCallState {
  data: TelecallerCallInformationPayload;
  state: OverlayState;
}

export default function TelecallerLayout() {
  const { isLoading, isProfileComplete, isUser, getTelecallerApprovalStatus } = useAuth();
  const pathname = usePathname();

  const [incomingCall, setIncomingCall] = useState<IncomingCallState | null>(null);
  const [socketReady, setSocketReady] = useState(false);

  const pendingCallRef = useRef<TelecallerCallInformationPayload | null>(null);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // Listen for socket ready
  useEffect(() => {
    if (getTelecallerApprovalStatus() !== "APPROVED") return;

    // Check if already connected
    if (isTelecallerSocketConnected()) {
      setSocketReady(true);
    }

    // Set callback for when socket becomes ready
    setOnSocketReady(() => {
      setSocketReady(true);
    });

    return () => {
      setOnSocketReady(null);
    };
  }, [getTelecallerApprovalStatus]);

  // Subscribe to call events when socket is ready
  useEffect(() => {
    if (getTelecallerApprovalStatus() !== "APPROVED") return;
    if (!socketReady) return;

    const socket = getTelecallerSocket();
    if (!socket) return;

    // ============================================
    // Handle Incoming Call
    // ============================================
    const handleIncomingCall = (data: TelecallerCallInformationPayload) => {
      // Protection 1: Already in a call/feedback screen (use ref for current value)
      const currentPath = pathnameRef.current;
      if (currentPath.includes('/audio-call') || currentPath.includes('/video-call') || currentPath.includes('/feedback')) {
        console.log('📞 Already in call/feedback screen, ignoring incoming call');
        return;
      }

      // Protection 2: Already showing incoming call overlay
      setIncomingCall((current) => {
        if (current) {
          console.log('📞 Already have incoming call overlay, ignoring');
          return current;
        }
        console.log('📞 Incoming call from:', data.caller.name);
        return { data, state: 'RINGING' };
      });
    };

    // ============================================
    // Handle Call Accepted (Token Received)
    // ============================================
    const handleCallAccepted = (data: TelecallerCallAcceptedPayload) => {
      console.log('✅ Received call:accepted with token');

      // Only process if we're in CONNECTING state and this is our pending call
      if (!pendingCallRef.current || pendingCallRef.current.callId !== data.callId) {
        console.log('📞 Received token for unknown call, ignoring');
        return;
      }

      const callData = pendingCallRef.current;
      const livekit = data.livekit;

      // Clear pending call
      pendingCallRef.current = null;

      // Navigate to audio-call with token
      const route = callData.callType === 'VIDEO'
        ? '/(app)/(call)/video-call'
        : '/(app)/(call)/audio-call';

      router.push({
        pathname: route,
        params: {
          callId: callData.callId,
          participantId: callData.caller._id,
          participantName: callData.caller.name,
          participantProfile: callData.caller.profile || '',
          callType: callData.callType,
          role: 'TELECALLER',
          livekitToken: livekit.token,
          livekitUrl: livekit.url,
          livekitRoomName: livekit.roomName,
        }
      });

      // Hide overlay
      setIncomingCall(null);
    };

    // ============================================
    // Handle Call Missed
    // ============================================
    const handleCallMissed = (data: CallIdPayload) => {
      console.log('📞 Call missed:', data.callId);
      pendingCallRef.current = null;
      setIncomingCall(null);
      showToast('Missed call');
    };

    // ============================================
    // Handle Call Cancelled
    // ============================================
    const handleCallCancelled = (data: CallIdPayload) => {
      console.log('📞 Call cancelled:', data.callId);
      pendingCallRef.current = null;
      setIncomingCall(null);
      showToast('Call was cancelled');
    };

    console.log('📞 Setting up call subscriptions');
    socket.on('call:incoming', handleIncomingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('call:missed', handleCallMissed);
    socket.on('call:cancelled', handleCallCancelled);

    return () => {
      console.log('📞 Cleaning up call subscriptions');
      socket.off('call:incoming', handleIncomingCall);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('call:missed', handleCallMissed);
      socket.off('call:cancelled', handleCallCancelled);
    };
  }, [getTelecallerApprovalStatus, socketReady]);

  // ============================================
  // Handle Accept Call
  // ============================================
  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    const callData = incomingCall.data;

    const hasPermission = await checkCallPermissions(callData.callType);
    if (!hasPermission) return;

    // Store pending call data
    pendingCallRef.current = callData;

    // Change overlay state to CONNECTING
    setIncomingCall({ data: callData, state: 'CONNECTING' });

    // Emit accept to server
    const success = emitCallAccept({ callId: callData.callId });
    if (!success) {
      showErrorToast('Connection issue. Please try again.');
      pendingCallRef.current = null;
      setIncomingCall(null);
      return;
    }

    console.log('📞 Emitted call:accept, waiting for token...');
  };

  // ============================================
  // Handle Reject Call
  // ============================================
  const handleRejectCall = () => {
    if (!incomingCall) return;

    const success = emitCallReject({ callId: incomingCall.data.callId });
    if (!success) {
      showErrorToast('Connection issue. Please try again.');
    }

    pendingCallRef.current = null;
    setIncomingCall(null);
  };

  // ============================================
  // Handle End Call (During CONNECTING state)
  // ============================================
  const handleEndCall = () => {
    if (!incomingCall) return;

    console.log('📞 Ending call during CONNECTING state');

    const success = emitCallEnd({ callId: incomingCall.data.callId });
    if (!success) {
      showErrorToast('Connection issue. Please try again.');
    }

    pendingCallRef.current = null;
    setIncomingCall(null);
  };

  // ============================================
  // Rendering
  // ============================================

  if (isLoading) {
    return <Loading />;
  }

  if (!isProfileComplete()) {
    return <Redirect href="/(app)/(onboarding)/profile-setup" />;
  }

  if (isUser()) {
    return <Redirect href="/(app)/(user)/home" />;
  }

  return (
    <View className="flex-1 bg-background">
      {getTelecallerApprovalStatus() === "APPROVED" && (
        <Header />
      )}

      <View className="flex-1">
        <Slot />
      </View>

      {getTelecallerApprovalStatus() === "APPROVED" && (
        <TabBar />
      )}

      {incomingCall && (
        <IncomingCallOverlay
          callData={incomingCall.data}
          state={incomingCall.state}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
          onEnd={handleEndCall}
        />
      )}
    </View>
  );
}