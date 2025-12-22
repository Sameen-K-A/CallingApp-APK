import { ConnectingState } from "@/components/call/ConnectingState";
import { VideoConnectedState } from "@/components/call/VideoConnectedState";
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

export default function VideoCall() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams() as unknown as CallParams;

  const initialCreds: LiveKitCredentials | null =
    params.role === "TELECALLER" && params.livekitToken
      ? { token: params.livekitToken, url: params.livekitUrl!, roomName: params.livekitRoomName! }
      : null;

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
    callType: "VIDEO",
    role: params.role,
    initialLiveKitCredentials: initialCreds,
  });

  const isAndroid = Platform.OS === "android";

  const isWaitingForRemote =
    !isEnding &&
    callState === "CONNECTED" &&
    (liveKit.connectionState !== "CONNECTED" || liveKit.remoteParticipant === null);

  const isRemoteCameraOff =
    !isEnding &&
    liveKit.remoteParticipant !== null &&
    liveKit.remoteVideoTrack === null;

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
              name={params.participantName || "Unknown"}
              profile={params.participantProfile}
              callType="VIDEO"
              onCancel={handleCancelCall}
            />
          </View>
        </LinearGradient>
      ) : (
        <View className="flex-1 bg-black">
          <VideoConnectedState
            name={params.participantName || "Unknown"}
            profile={params.participantProfile}
            timer={formattedTime}
            isWaitingForRemote={isWaitingForRemote}
            isMuted={liveKit.isMuted}
            isCameraOff={liveKit.isCameraOff}
            isRemoteCameraOff={isRemoteCameraOff}
            localVideoTrack={liveKit.localVideoTrack}
            remoteVideoTrack={liveKit.remoteVideoTrack}
            topInset={insets.top}
            bottomInset={isAndroid ? insets.bottom : 0}
            onToggleMute={liveKit.toggleMute}
            onToggleCamera={liveKit.toggleCamera}
            onEndCall={handleEndCall}
          />
        </View>
      )}
    </>
  );
}