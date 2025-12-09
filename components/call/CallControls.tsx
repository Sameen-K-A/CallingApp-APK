import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface BaseCallControlsProps {
  isMuted: boolean;
  isSpeakerOn: boolean;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
}

interface AudioCallControlsProps extends BaseCallControlsProps {
  callType: "AUDIO";
}

interface VideoCallControlsProps extends BaseCallControlsProps {
  callType: "VIDEO";
  isCameraOff: boolean;
  onToggleCamera: () => void;
}

type CallControlsProps = AudioCallControlsProps | VideoCallControlsProps;

interface ControlButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  isActive?: boolean;
  isDanger?: boolean;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  icon,
  onPress,
  isActive = false,
  isDanger = false,
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      className={`w-12 h-12 rounded-full items-center justify-center ${isDanger ? "bg-red-500" : isActive ? "bg-white" : "bg-white/20"}`}
    >
      <Ionicons
        name={icon}
        size={22}
        color={isDanger ? "#FFFFFF" : isActive ? "#000000" : "#FFFFFF"}
      />
    </TouchableOpacity>
  );
};

export const CallControls: React.FC<CallControlsProps> = (props) => {
  const { callType, isMuted, isSpeakerOn, onToggleMute, onToggleSpeaker, onEndCall } = props;

  return (
    <View className="items-center px-6">
      <View className="flex-row items-center justify-center gap-6 bg-black/80 px-6 py-4 rounded-full">
        {callType === "VIDEO" && (
          <ControlButton
            icon={props.isCameraOff ? "videocam-off" : "videocam"}
            onPress={props.onToggleCamera}
            isActive={props.isCameraOff}
          />
        )}

        <ControlButton
          icon={isMuted ? "mic-off" : "mic"}
          onPress={onToggleMute}
          isActive={isMuted}
        />

        <ControlButton
          icon={isSpeakerOn ? "volume-high" : "volume-low"}
          onPress={onToggleSpeaker}
          isActive={isSpeakerOn}
        />

        <ControlButton
          icon="call"
          onPress={onEndCall}
          isDanger
        />
      </View>
    </View>
  );
};