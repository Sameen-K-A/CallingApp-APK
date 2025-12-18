import { AudioConnectedState } from "@/components/call/AudioConnectedState";
import { ConnectingState } from "@/components/call/ConnectingState";
import { useActiveCall } from "@/hooks/useActiveCall";
import { LiveKitCredentials } from "@/socket/types";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
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

  // Prepare initial credentials for Telecaller
  const initialCreds: LiveKitCredentials | null =
    params.role === "TELECALLER" && params.livekitToken
      ? { token: params.livekitToken, url: params.livekitUrl!, roomName: params.livekitRoomName! }
      : null;

  // Use the new hook
  const {
    callState,
    isEnding,
    formattedTime,
    liveKit,
    handleEndCall,
    handleCancelCall,
  } = useActiveCall({
    initialCallId: params.callId,
    participantId: params.participantId,
    callType: "AUDIO",
    role: params.role,
    initialLiveKitCredentials: initialCreds,
  });

  const isAndroid = Platform.OS === "android";

  const isWaitingForRemote =
    !isEnding &&
    callState === "CONNECTED" &&
    (liveKit.connectionState !== "CONNECTED" || liveKit.remoteParticipant === null);

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
              name={params.participantName || "Unknown"}
              profile={params.participantProfile}
              callType="AUDIO"
              onCancel={handleCancelCall}
            />
          ) : (
            <AudioConnectedState
              name={params.participantName || "Unknown"}
              profile={params.participantProfile}
              timer={formattedTime}
              isWaitingForRemote={isWaitingForRemote}
              isMuted={liveKit.isMuted}
              isSpeakerOn={liveKit.isSpeakerOn}
              onToggleMute={liveKit.toggleMute}
              onToggleSpeaker={liveKit.toggleSpeaker}
              onEndCall={handleEndCall}
            />
          )}
        </View>
      </LinearGradient>
    </>
  );
}