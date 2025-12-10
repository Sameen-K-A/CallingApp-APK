import { Avatar } from "@/components/shared/avatars";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { TelecallerListItem } from "@/types/user";
import { getInitials } from "@/utils/formatter";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface TelecallerProfileSheetProps {
  visible: boolean;
  telecaller: TelecallerListItem | null;
  onClose: () => void;
  onToggleFavorite: (telecaller: TelecallerListItem) => void;
  isFavorite?: boolean;
  isFavoriteLoading?: boolean;
}

export const TelecallerProfileSheet: React.FC<TelecallerProfileSheetProps> = ({
  visible,
  telecaller,
  onClose,
  onToggleFavorite,
  isFavorite = false,
  isFavoriteLoading = false,
}) => {
  if (!telecaller) return null;

  const isAvailable = telecaller.presence === "ONLINE";

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

  const handleClose = () => {
    if (isFavoriteLoading) return;
    onClose();
  };

  const handleVoiceCall = () => {
    onClose();
    setTimeout(() => {
      router.replace({
        pathname: "/(app)/(call)/audio-call",
        params: {
          participantId: telecaller._id,
          participantName: telecaller.name,
          participantProfile: telecaller.profile || "",
          callType: "AUDIO",
          role: "USER",
        },
      });
    }, 300);
  };

  const handleVideoCall = () => {
    onClose();
    setTimeout(() => {
      router.replace({
        pathname: "/(app)/(call)/video-call",
        params: {
          participantId: telecaller._id,
          participantName: telecaller.name,
          participantProfile: telecaller.profile || "",
          callType: "VIDEO",
          role: "USER",
        },
      });
    }, 300);
  };

  return (
    <Drawer visible={visible} onClose={handleClose}>
      <Drawer.Content>
        <View className="items-center pb-6">
          <View className="relative mb-4">
            <View className="w-28 h-28 rounded-full bg-muted border-4 border-primary/20 items-center justify-center overflow-hidden">
              {telecaller.profile?.startsWith("avatar-") ? (
                <Avatar avatarId={telecaller.profile} size={105} />
              ) : (
                <Text
                  className="text-3xl font-semibold text-primary"
                  allowFontScaling={false}
                >
                  {getInitials(telecaller.name)}
                </Text>
              )}
            </View>
            <View className={`absolute bottom-1 right-1 w-7 h-7 rounded-full border-4 border-background items-center justify-center ${getPresenceColor()}`} />
          </View>

          <Text
            allowFontScaling={false}
            className="text-2xl font-bold text-text mb-1"
          >
            {telecaller.name}
          </Text>

          {telecaller.language && (
            <View className="flex-row items-center px-2 py-0.5 bg-secondary rounded-full">
              <Ionicons name="language-outline" size={12} color="#5B21B6" />
              <Text
                allowFontScaling={false}
                className="text-xs font-medium text-secondaryForeground ml-1"
              >
                {telecaller.language}
              </Text>
            </View>
          )}

          <View className="flex-row items-center justify-center gap-2 mt-4">
            <Button
              className={`rounded-full border-destructive ${isFavoriteLoading && "opacity-50"}`}
              variant="outline"
              size="icon-lg"
              onPress={() => onToggleFavorite(telecaller)}
              disabled={isFavoriteLoading}
            >
              {isFavoriteLoading ? (
                <ActivityIndicator size={24} color="#EF4444" />
              ) : (
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={24}
                  color="#EF4444"
                />
              )}
            </Button>

            <Button
              className={`rounded-full ${!isAvailable && "opacity-50"}`}
              size="icon-lg"
              disabled={!isAvailable}
              onPress={handleVoiceCall}
            >
              <Ionicons name="call" size={24} color="#FFFFFF" />
            </Button>

            <Button
              className={`rounded-full ${!isAvailable && "opacity-50"}`}
              size="icon-lg"
              disabled={!isAvailable}
              onPress={handleVideoCall}
            >
              <Ionicons name="videocam" size={24} color="#FFFFFF" />
            </Button>
          </View>

          <View className="flex-row items-center justify-center mt-5 px-4 py-2.5 bg-amber-50 rounded-full border border-amber-200">
            <Ionicons name="information-circle" size={18} color="#F59E0B" />
            <Text
              allowFontScaling={false}
              className="text-sm text-amber-700 ml-2"
            >
              <Text className="font-bold">1 coin/sec</Text>
              {" for audio • "}
              <Text className="font-bold">3 coins/sec</Text>
              {" for video call"}
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <Text
            allowFontScaling={false}
            className="text-sm font-semibold text-textMuted tracking-normal mb-2"
          >
            About me
          </Text>
          <View className="bg-muted/50 rounded-xl p-4">
            <Text
              allowFontScaling={false}
              className="text-base text-text leading-6"
            >
              {telecaller.about}
            </Text>
          </View>
        </View>
      </Drawer.Content>
    </Drawer>
  );
};