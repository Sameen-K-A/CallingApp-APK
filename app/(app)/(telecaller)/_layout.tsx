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

    const handleCallAccepted = (data: TelecallerCallInformationPayload) => {
      console.log('📞 Call accepted confirmation received:', data);

      setIncomingCall(null);

      const route = data.callType === 'VIDEO'
        ? '/(app)/(call)/video-call'
        : '/(app)/(call)/audio-call';

      router.replace({
        pathname: route,
        params: {
          callId: data.callId,
          participantId: data.caller._id,
          participantName: data.caller.name,
          participantProfile: data.caller.profile || '',
          callType: data.callType,
          role: 'TELECALLER'
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getTelecallerApprovalStatus, socketReady, router]);

  // ========================================= Handle accept call ====================================
  const handleAcceptCall = () => {
    if (!incomingCall) return;

    const success = emitCallAccept({ callId: incomingCall.callId });
    if (!success) {
      showErrorToast('Connection issue. Please try again.');
      setIncomingCall(null);
    }
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