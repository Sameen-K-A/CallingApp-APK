import { IncomingCallOverlay } from "@/components/call/IncomingCallOverlay";
import { Loading } from "@/components/shared/Loading";
import { Header } from "@/components/telecaller/Header";
import { TabBar } from "@/components/telecaller/TabBar";
import { useAuth } from "@/context/AuthContext";
import { getTelecallerSocket, isTelecallerSocketConnected, setOnSocketReady } from "@/socket/telecaller.socket";
import { CallIncomingPayload } from "@/socket/types";
import { Redirect, Slot } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

export default function TelecallerLayout() {
  const { isLoading, isProfileComplete, isUser, getTelecallerApprovalStatus } = useAuth();
  const [incomingCall, setIncomingCall] = useState<CallIncomingPayload | null>(null);
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

    const handleIncomingCall = (data: CallIncomingPayload) => {
      setIncomingCall((current) => {
        if (current) {
          console.log('📞 Already have incoming call, ignoring');
          return current;
        }
        return data;
      });
    };

    socket.on('call:incoming', handleIncomingCall);

    return () => {
      socket.off('call:incoming', handleIncomingCall);
    };
  }, [getTelecallerApprovalStatus, socketReady]);

  const handleAcceptCall = () => {
    if (!incomingCall) return;
    console.log('📞 Accepting call:', incomingCall.callId);
    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    if (!incomingCall) return;
    console.log('📞 Rejecting call:', incomingCall.callId);
    setIncomingCall(null);
  };

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