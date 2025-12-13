import { Avatar } from "@/components/shared/avatars";
import { TelecallerListItem } from "@/types/user";
import { getInitials } from "@/utils/formatter";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface TelecallerCardProps {
  telecaller: TelecallerListItem;
  onToggleFavorite: (telecaller: TelecallerListItem) => void;
  onVoiceCall: (telecaller: TelecallerListItem) => void;
  onVideoCall: (telecaller: TelecallerListItem) => void;
}

export const TelecallerCard: React.FC<TelecallerCardProps> = ({
  telecaller,
  onToggleFavorite,
  onVoiceCall,
  onVideoCall,
}) => {
  const getPresenceConfig = () => {
    switch (telecaller.presence) {
      case "ONLINE":
        return {
          color: "bg-success",
          text: "Online",
          textColor: "text-success",
          bgLight: "bg-success/10",
        };
      case "ON_CALL":
        return {
          color: "bg-warning",
          text: "On Call",
          textColor: "text-warning",
          bgLight: "bg-warning/10",
        };
      case "OFFLINE":
        return {
          color: "bg-gray-400",
          text: "Offline",
          textColor: "text-gray-500",
          bgLight: "bg-gray-100",
        };
      default:
        return {
          color: "bg-gray-400",
          text: "Offline",
          textColor: "text-gray-500",
          bgLight: "bg-gray-100",
        };
    }
  };

  const presence = getPresenceConfig();
  const isAvailable = telecaller.presence === "ONLINE";

  const handleToggleFavorite = () => {
    onToggleFavorite(telecaller);
  };

  const handleVoiceCall = () => {
    if (isAvailable) {
      onVoiceCall(telecaller);
    }
  };

  const handleVideoCall = () => {
    if (isAvailable) {
      onVideoCall(telecaller);
    }
  };

  return (
    <View className="bg-card rounded-2xl p-4 mb-3 border border-border/50">
      <View className="flex-row items-start">
        <View className="relative">
          <View className="w-14 h-14 rounded-full bg-muted border-2 border-primary/20 items-center justify-center overflow-hidden">
            {telecaller.profile?.startsWith("avatar-") ? (
              <Avatar avatarId={telecaller.profile} size={52} />
            ) : (
              <Text
                className="text-lg font-semibold text-primary"
                allowFontScaling={false}
              >
                {getInitials(telecaller.name)}
              </Text>
            )}
          </View>
          <View
            className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card ${presence.color}`}
          />
        </View>

        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <Text
              className="text-base font-semibold text-text flex-1"
              numberOfLines={1}
              allowFontScaling={false}
            >
              {telecaller.name}
            </Text>
            <TouchableOpacity
              className="p-1.5"
              onPress={handleToggleFavorite}
              activeOpacity={0.7}
            >
              <Ionicons
                name={telecaller.isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={telecaller.isFavorite ? "#EF4444" : "#9CA3AF"}
              />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center mt-1 gap-2">
            <View
              className={`flex-row items-center px-2 py-0.5 rounded-full ${presence.bgLight}`}
            >
              <View
                className={`w-1.5 h-1.5 rounded-full ${presence.color} mr-1`}
              />
              <Text
                className={`text-xs font-medium ${presence.textColor}`}
                allowFontScaling={false}
              >
                {presence.text}
              </Text>
            </View>

            {telecaller.language && (
              <View className="flex-row items-center px-2 py-0.5 bg-secondary/50 rounded-full">
                <Ionicons name="language-outline" size={10} color="#5B21B6" />
                <Text
                  className="text-xs font-medium text-secondaryForeground ml-1"
                  allowFontScaling={false}
                >
                  {telecaller.language}
                </Text>
              </View>
            )}
          </View>

          <Text
            className="text-sm text-textMuted mt-1.5 leading-5"
            numberOfLines={2}
            allowFontScaling={false}
          >
            {telecaller.about}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mt-4 gap-2">
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl border ${isAvailable
              ? "bg-success/5 border-success/30"
              : "bg-gray-50 border-gray-200"
            }`}
          disabled={!isAvailable}
          onPress={handleVoiceCall}
          activeOpacity={0.7}
        >
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${isAvailable ? "bg-success" : "bg-gray-300"
              }`}
          >
            <Ionicons name="call" size={16} color="#FFFFFF" />
          </View>
          <View className="ml-2">
            <Text
              className={`text-xs font-semibold ${isAvailable ? "text-text" : "text-gray-400"
                }`}
              allowFontScaling={false}
            >
              Voice Call
            </Text>
            <Text
              className={`text-[10px] ${isAvailable ? "text-success" : "text-gray-400"
                }`}
              allowFontScaling={false}
            >
              1 coin/sec
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl border ${isAvailable
              ? "bg-primary/5 border-primary/30"
              : "bg-gray-50 border-gray-200"
            }`}
          disabled={!isAvailable}
          onPress={handleVideoCall}
          activeOpacity={0.7}
        >
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${isAvailable ? "bg-primary" : "bg-gray-300"
              }`}
          >
            <Ionicons name="videocam" size={16} color="#FFFFFF" />
          </View>
          <View className="ml-2">
            <Text
              className={`text-xs font-semibold ${isAvailable ? "text-text" : "text-gray-400"
                }`}
              allowFontScaling={false}
            >
              Video Call
            </Text>
            <Text
              className={`text-[10px] ${isAvailable ? "text-primary" : "text-gray-400"
                }`}
              allowFontScaling={false}
            >
              3 coins/sec
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};