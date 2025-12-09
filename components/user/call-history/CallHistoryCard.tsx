import { Avatar } from "@/components/shared/avatars";
import { Button } from "@/components/ui/button";
import { ICallHistoryItem } from "@/types/user";
import { getInitials } from "@/utils/formatter";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CallHistoryCardProps {
  call: ICallHistoryItem;
  onPress: (call: ICallHistoryItem) => void;
}

export const CallHistoryCard: React.FC<CallHistoryCardProps> = ({ call, onPress }) => {
  const isMissed = call.status === "MISSED";
  const isRejected = call.status === "REJECTED";
  const isCompleted = call.status === "COMPLETED";
  const isVideo = call.callType === "VIDEO";
  const isFailedCall = isMissed || isRejected;

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return "0s";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }

    if (minutes > 0) {
      return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
    }

    return `${secs}s`;
  };

  const formatRelativeTime = (dateString: string): string => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getStatusText = (): string => {
    if (isMissed) return "Missed";
    if (isRejected) return "Rejected";
    if (isCompleted) return formatDuration(call.durationInSeconds);
    return call.status;
  };

  return (
    <TouchableOpacity
      className="bg-card rounded-2xl p-4 mb-2 border border-muted"
      activeOpacity={0.7}
      onPress={() => onPress(call)}
    >
      <View className="flex-row items-center">
        <View className="relative">
          <View className="w-14 h-14 rounded-full bg-muted border-2 border-primary/20 items-center justify-center overflow-hidden">
            {call.telecaller.profile?.startsWith("avatar-") ? (
              <Avatar avatarId={call.telecaller.profile} size={52} />
            ) : (
              <Text
                className="text-lg font-semibold text-primary"
                allowFontScaling={false}
              >
                {getInitials(call.telecaller.name)}
              </Text>
            )}
          </View>

          <View className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-card items-center justify-center ${isFailedCall ? "bg-destructive" : "bg-success"}`} >
            <Ionicons
              name={isVideo ? "videocam" : "call"}
              size={10}
              color="#FFFFFF"
            />
          </View>
        </View>

        <View className="flex-1 ml-3">
          <Text
            allowFontScaling={false}
            className="text-base font-semibold text-text mb-1.5"
            numberOfLines={1}
          >
            {call.telecaller.name}
          </Text>

          <View className="flex-row items-center mb-1">
            <View className={`flex-row items-center px-2.5 py-1 rounded-full ${isFailedCall ? "bg-destructive/10" : "bg-success/10"}`} >
              <Ionicons
                name={isFailedCall ? "arrow-down-left-box-sharp" : "arrow-up-right-box-sharp"}
                size={12}
                color={isFailedCall ? "#EF4444" : "#22C55E"}
              />
              <Text
                allowFontScaling={false}
                className={`text-xs font-medium ml-1 ${isFailedCall ? "text-destructive" : "text-success"}`}
              >
                {getStatusText()}
              </Text>
            </View>

            <View className="flex-row items-center ml-2 px-2 py-1 bg-muted rounded-full">
              <Ionicons
                name={isVideo ? "videocam-outline" : "call-outline"}
                size={12}
                color="#6B7280"
              />
              <Text
                allowFontScaling={false}
                className="text-xs text-textMuted ml-1"
              >
                {isVideo ? "Video" : "Audio"}
              </Text>
            </View>
          </View>

          <Text
            allowFontScaling={false}
            className="text-xs text-textMuted"
          >
            {formatRelativeTime(call.createdAt)}
          </Text>
        </View>

        <Button
          className="ml-3 rounded-full"
          variant="outline"
          size="icon-sm"
          onPress={() => onPress(call)}
        >
          <Ionicons
            allowFontScaling={false}
            name="chevron-forward"
            size={15}
            color="#6B7280"
          />
        </Button>
      </View>
    </TouchableOpacity>
  );
};