import { AudioConnectedState } from "@/components/call/AudioConnectedState";
import { CallRoomWrapper } from "@/components/call/CallRoomWrapper";
import { ConnectingState } from "@/components/call/ConnectingState";
import { useActiveCall } from "@/hooks/useActiveCall";
import { useCallTimer } from "@/hooks/useCallTimer";
import { LiveKitCredentials } from "@/socket/types";
import { showErrorToast } from "@/utils/toast";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Role = "USER" | "TELECALLER";

interface CallParams {
  callId?: string;
  participantId: string;
  participantName: string;
  participantProfile: string;
  role: Role;
  livekitToken?: string;
  livekitUrl?: string;
  livekitRoomName?: string;
}

export default function AudioCall() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams() as unknown as CallParams;

  const initialCreds: LiveKitCredentials | null =
    params.role === "TELECALLER" && params.livekitToken
      ? { token: params.livekitToken, url: params.livekitUrl!, roomName: params.livekitRoomName! }
      : null;

  const {
    callState,
    livekitCredentials,
    handleEndCall,
    handleCancelCall,
  } = useActiveCall({
    initialCallId: params.callId,
    participantId: params.participantId,
    callType: "AUDIO",
    role: params.role,
    initialLiveKitCredentials: initialCreds,
  });

  const { formatted, start: startTimer } = useCallTimer();
  const timerStartedRef = useRef(false);

  const isAndroid = Platform.OS === "android";

  const handleTimerStart = useCallback(() => {
    if (!timerStartedRef.current) {
      timerStartedRef.current = true;
      startTimer();
      console.log('⏱️ Timer started');
    }
  }, [startTimer]);

  const handleConnected = useCallback(() => {
    console.log('✅ LiveKit Connected');
  }, []);

  const handleDisconnected = useCallback(() => {
    console.log('❌ LiveKit Disconnected');
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('❌ LiveKit Error:', error);
    showErrorToast('Call connection failed');
  }, []);

  // Determine which credentials to use
  const activeCredentials = livekitCredentials || initialCreds;

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
          {callState === "CONNECTED" && activeCredentials ? (
            <CallRoomWrapper
              credentials={activeCredentials}
              callType="AUDIO"
              onConnected={handleConnected}
              onDisconnected={handleDisconnected}
              onError={handleError}
            >
              <AudioConnectedState
                name={params.participantName || "Unknown"}
                profile={params.participantProfile}
                timer={formatted}
                onTimerStart={handleTimerStart}
                onEndCall={handleEndCall}
              />
            </CallRoomWrapper>
          ) : (
            <ConnectingState
              name={params.participantName || "Unknown"}
              profile={params.participantProfile}
              callType="AUDIO"
              onCancel={handleCancelCall}
            />
          )}
        </View>
      </LinearGradient>
    </>
  );
}