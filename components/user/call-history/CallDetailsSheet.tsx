import { Avatar } from "@/components/shared/avatars";
import { Drawer } from "@/components/ui/drawer";
import { ICallHistoryItem } from "@/types/user";
import { getInitials } from "@/utils/formatter";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import React from "react";
import { Text, View } from "react-native";

interface CallDetailsSheetProps {
  visible: boolean;
  call: ICallHistoryItem | null;
  onClose: () => void;
}

export const CallDetailsSheet: React.FC<CallDetailsSheetProps> = ({ visible, call, onClose }) => {
  if (!call) return null;

  const isMissed = call.status === "MISSED";
  const isRejected = call.status === "REJECTED";
  const isCompleted = call.status === "COMPLETED";
  const isVideo = call.callType === "VIDEO";
  const isFailedCall = isMissed || isRejected;

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return "—";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const formatDateTime = (date: string) =>
    format(new Date(date), "MMM d, yyyy 'at' h:mm a");

  const renderStatusBadge = () => {
    const isFailed = isMissed || isRejected;
    return (
      <View className={`flex-row items-center px-3 py-1.5 rounded-full ${isFailed ? "bg-destructive/10" : "bg-success/10"}`}>
        <Ionicons
          name={isFailed ? "close-circle" : "checkmark-circle"}
          size={16}
          color={isFailed ? "#EF4444" : "#22C55E"}
        />
        <Text
          allowFontScaling={false}
          className={`text-sm font-medium ml-1 ${isFailed ? "text-destructive" : "text-success"}`}
        >
          {isMissed ? "Missed" : isRejected ? "Rejected" : "Completed"}
        </Text>
      </View>
    );
  };

  return (
    <Drawer visible={visible} onClose={onClose}>
      <Drawer.Content>

        <Drawer.Header>
          <View className="relative mb-3">
            <View className="w-20 h-20 rounded-full bg-muted border-4 border-primary/20 items-center justify-center overflow-hidden">
              {call.telecaller.profile?.startsWith("avatar-") ? (
                <Avatar avatarId={call.telecaller.profile} size={72} />
              ) : (
                <Text
                  className="text-2xl font-semibold text-primary"
                  allowFontScaling={false}
                >
                  {getInitials(call.telecaller.name)}
                </Text>
              )}
            </View>

            <View className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-background items-center justify-center ${isFailedCall ? "bg-destructive" : "bg-success"}`} >
              <Ionicons
                name={isVideo ? "videocam" : "call"}
                size={14}
                color="#FFFFFF"
              />
            </View>
          </View>

          <Text
            allowFontScaling={false}
            className="text-xl font-bold text-text mb-2"
          >
            {call.telecaller.name}
          </Text>

          {renderStatusBadge()}
        </Drawer.Header>

        <View className="bg-muted/50 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between py-2.5 border-b border-border/50">
            <Text allowFontScaling={false} className="text-sm text-textMuted">
              Call Type
            </Text>
            <View className="flex-row items-center">
              <Ionicons
                name={isVideo ? "videocam" : "call"}
                size={16}
                color="#8B5CF6"
              />
              <Text
                allowFontScaling={false}
                className="text-sm font-medium text-text ml-1.5"
              >
                {isVideo ? "Video Call" : "Audio Call"}
              </Text>
            </View>
          </View>

          <View className={`flex-row items-center justify-between py-2.5 ${isCompleted ? "border-b border-border/50" : ""}`}>
            <Text allowFontScaling={false} className="text-sm text-textMuted">
              Date & Time
            </Text>
            <Text
              allowFontScaling={false}
              className="text-sm font-medium text-text"
            >
              {formatDateTime(call.createdAt)}
            </Text>
          </View>

          {isCompleted && (
            <>
              <View className="flex-row items-center justify-between py-2.5 border-b border-border/50">
                <Text
                  allowFontScaling={false}
                  className="text-sm text-textMuted"
                >
                  Duration
                </Text>
                <Text
                  allowFontScaling={false}
                  className="text-sm font-medium text-text"
                >
                  {formatDuration(call.durationInSeconds)}
                </Text>
              </View>

              <View className="flex-row items-center justify-between py-2.5">
                <Text
                  allowFontScaling={false}
                  className="text-sm text-textMuted"
                >
                  Coins Spent
                </Text>
                <View className="flex-row items-center">
                  <FontAwesome6 name="coins" size={14} color="#F59E0B" />
                  <Text
                    allowFontScaling={false}
                    className="text-sm font-medium text-amber-500 ml-1.5"
                  >
                    {call.coinsSpent}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {call.userFeedback && (
          <View>
            <Text
              allowFontScaling={false}
              className="text-sm font-semibold text-textMuted mb-2"
            >
              Your Feedback
            </Text>
            <View className="bg-muted/50 rounded-xl p-3">
              <Text
                allowFontScaling={false}
                className="text-sm text-text leading-5"
              >
                {call.userFeedback}
              </Text>
            </View>
          </View>
        )}
      </Drawer.Content>
    </Drawer>
  );
};