import { IncomingCallOverlay } from "@/components/call/IncomingCallOverlay";
import { Loading } from "@/components/shared/Loading";
import { Header } from "@/components/telecaller/Header";
import { TabBar } from "@/components/telecaller/TabBar";
import { useAuth } from "@/context/AuthContext";
import {
  emitCallAccept,
  emitCallReject,
  getTelecallerSocket,
  isTelecallerSocketConnected,
  setOnSocketReady
} from "@/socket/telecaller.socket";
import {
  CallIdPayload,
  TelecallerCallInformationPayload
} from "@/socket/types";
import { checkCallPermissions } from "@/utils/permission";
import { showErrorToast, showToast } from "@/utils/toast";
import { Redirect, router, Slot } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

export default function TelecallerLayout() {
  const { isLoading, isProfileComplete, isUser, getTelecallerApprovalStatus } = useAuth();
  const [incomingCall, setIncomingCall] = useState<TelecallerCallInformationPayload | null>(null);
  const [socketReady, setSocketReady] = useState(false);

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

  // Subscribe to incoming calls when socket is ready
  useEffect(() => {
    if (getTelecallerApprovalStatus() !== "APPROVED") return;
    if (!socketReady) return;

    const socket = getTelecallerSocket();
    if (!socket) return;

    const handleIncomingCall = (data: TelecallerCallInformationPayload) => {
      setIncomingCall((current) => {
        if (current) {
          console.log('📞 Already have incoming call, ignoring');
          return current;
        }
        return data;
      });
    };

    const handleCallMissed = (data: CallIdPayload) => {
      setIncomingCall(null);
      showToast('Missed call');
    };

    const handleCallCancelled = (data: CallIdPayload) => {
      setIncomingCall(null);
      showToast('Call was cancelled');
    };

    socket.on('call:incoming', handleIncomingCall);
    socket.on('call:missed', handleCallMissed);
    socket.on('call:cancelled', handleCallCancelled);

    return () => {
      console.log('📞 Cleaning up call subscriptions');
      socket.off('call:incoming', handleIncomingCall);
      socket.off('call:missed', handleCallMissed);
      socket.off('call:cancelled', handleCallCancelled);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getTelecallerApprovalStatus, socketReady, router]);

  // ========================================= Handle accept call ====================================
  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    const hasPermission = await checkCallPermissions(incomingCall.callType);
    if (!hasPermission) return;

    const success = emitCallAccept({ callId: incomingCall.callId });
    if (!success) {
      showErrorToast('Connection issue. Please try again.');
      setIncomingCall(null);
      return;
    }

    // Pass basic info, but NO TOKEN yet. The screen will show "Connecting..."
    const route = incomingCall.callType === 'VIDEO'
      ? '/(app)/(call)/video-call'
      : '/(app)/(call)/audio-call';

    router.push({
      pathname: route,
      params: {
        callId: incomingCall.callId,
        participantId: incomingCall.caller._id,
        participantName: incomingCall.caller.name,
        participantProfile: incomingCall.caller.profile || '',
        callType: incomingCall.callType,
        role: 'TELECALLER'
      }
    });

    setIncomingCall(null);
  };

  // ========================================= Handle reject call ====================================
  const handleRejectCall = () => {
    if (!incomingCall) return;

    const success = emitCallReject({ callId: incomingCall.callId });
    if (!success) {
      showErrorToast('Connection issue. Please try again.');
    }
    setIncomingCall(null);
  };

  // ====================================== rendering ===========================================

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
          callData={incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}
    </View>
  );
}