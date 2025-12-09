import { Drawer } from "@/components/ui/drawer";
import { HELP_CONTENT } from "@/constants/help";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ContactDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export const ContactDrawer: React.FC<ContactDrawerProps> = ({ visible, onClose }) => {
  const { contact } = HELP_CONTENT;

  const handleEmailPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`mailto:${contact.email}`);
  };

  return (
    <Drawer visible={visible} onClose={onClose}>
      <Drawer.Content>
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
            <Ionicons name="mail" size={40} color="#8B5CF6" />
          </View>

          <Text
            allowFontScaling={false}
            className="text-lg font-semibold text-text mb-2"
          >
            {contact.heading}
          </Text>

          <Text
            allowFontScaling={false}
            className="text-sm text-textMuted text-center leading-5"
          >
            {contact.description}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleEmailPress}
          className="flex-row items-center p-4 bg-muted rounded-2xl border border-border"
        >
          <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4">
            <Ionicons name="mail-outline" size={24} color="#8B5CF6" />
          </View>

          <View className="flex-1">
            <Text
              allowFontScaling={false}
              className="text-sm text-textMuted mb-1"
            >
              {contact.emailLabel}
            </Text>
            <Text
              allowFontScaling={false}
              className="text-base font-semibold text-primary"
            >
              {contact.email}
            </Text>
          </View>

          <Ionicons name="open-outline" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <View className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <View className="flex-row items-start">
            <Ionicons name="time-outline" size={20} color="#F59E0B" />
            <View className="flex-1 ml-3">
              <Text
                allowFontScaling={false}
                className="text-sm font-semibold text-amber-700 mb-1"
              >
                {contact.responseTimeTitle}
              </Text>
              <Text
                allowFontScaling={false}
                className="text-sm text-amber-600 leading-5"
              >
                {contact.responseTimeDescription}
              </Text>
            </View>
          </View>
        </View>
      </Drawer.Content>
    </Drawer>
  );
};