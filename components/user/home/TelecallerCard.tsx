import { Avatar } from "@/components/shared/avatars";
import { Button } from "@/components/ui/button";
import { TelecallerListItem } from "@/types/user";
import { getInitials } from "@/utils/formatter";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface TelecallerCardProps {
  telecaller: TelecallerListItem;
  onPress: (telecaller: TelecallerListItem) => void;
}

export const TelecallerCard: React.FC<TelecallerCardProps> = ({ telecaller, onPress }) => {
  const getPresenceColor = () => {
    switch (telecaller.presence) {
      case "ONLINE":
        return "bg-success";
      case "ON_CALL":
        return "bg-warning";
      case "OFFLINE":
        return "bg-destructive";
      default:
        return "bg-destructive";
    }
  };

  return (
    <TouchableOpacity
      className="bg-card rounded-2xl p-4 mb-2 border border-border/50"
      activeOpacity={0.7}
      onPress={() => onPress(telecaller)}
    >
      <View className="flex-row items-center">
        <View className="relative">
          <View className="w-16 h-16 rounded-full bg-muted border-2 border-primary/20 items-center justify-center overflow-hidden">
            {telecaller.profile?.startsWith("avatar-") ? (
              <Avatar avatarId={telecaller.profile} size={60} />
            ) : (
              <Text
                className="text-xl font-semibold text-primary"
                allowFontScaling={false}
              >
                {getInitials(telecaller.name)}
              </Text>
            )}
          </View>

          <View className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-card items-center justify-center ${getPresenceColor()}`}>
            <View className="w-2 h-2 rounded-full bg-white" />
          </View>
        </View>

        <View className="flex-1 ml-4">
          <Text
            allowFontScaling={false}
            className="text-base font-semibold text-text mb-1"
            numberOfLines={1}
          >
            {telecaller.name}
          </Text>

          {telecaller.language && (
            <View className="flex-row mb-1.5">
              <View className="flex-row items-center px-2 py-0.5 bg-secondary rounded-full">
                <Ionicons name="language-outline" size={12} color="#5B21B6" />
                <Text
                  allowFontScaling={false}
                  className="text-xs font-medium text-secondaryForeground ml-1"
                >
                  {telecaller.language}
                </Text>
              </View>
            </View>
          )}

          <Text
            allowFontScaling={false}
            className="text-sm text-textMuted leading-5"
            numberOfLines={2}
          >
            {telecaller.about}
          </Text>
        </View>

        <Button
          className="ml-3 rounded-full"
          variant="outline"
          size="icon-sm"
          onPress={() => onPress(telecaller)}
        >
          <Ionicons
            allowFontScaling={false}
            name="chevron-forward"
            size={15}
            color={"#6B7280"}
          />
        </Button>
      </View>
    </TouchableOpacity>
  );
};