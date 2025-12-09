import { Drawer } from "@/components/ui/drawer";
import { HELP_CONTENT } from "@/constants/help";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface BugReportDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export const BugReportDrawer: React.FC<BugReportDrawerProps> = ({ visible, onClose }) => {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { bugReport } = HELP_CONTENT;

  const handleSubmit = async () => {
    if (!description.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    setTimeout(() => {
      setDescription("");
      setIsSubmitted(false);
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    setDescription("");
    setIsSubmitted(false);
    onClose();
  };

  return (
    <Drawer visible={visible} onClose={handleClose}>
      <Drawer.Content>
        {isSubmitted ? (
          <View className="items-center py-8">
            <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            </View>

            <Text
              allowFontScaling={false}
              className="text-xl font-bold text-text mb-2"
            >
              {bugReport.successTitle}
            </Text>

            <Text
              allowFontScaling={false}
              className="text-base text-textMuted text-center"
            >
              {bugReport.successMessage}
            </Text>
          </View>
        ) : (
          <>
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
                <Ionicons name="bug" size={32} color="#EF4444" />
              </View>

              <Text
                allowFontScaling={false}
                className="text-sm text-textMuted text-center leading-5"
              >
                {bugReport.heading}
              </Text>
            </View>

            <Text
              allowFontScaling={false}
              className="text-sm font-semibold text-text mb-2"
            >
              {bugReport.inputLabel}
            </Text>

            <View className="bg-input border border-border rounded-2xl overflow-hidden mb-2">
              <TextInput
                className="p-4 text-base text-text min-h-[120px]"
                placeholder={bugReport.inputPlaceholder}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
                allowFontScaling={false}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
                maxLength={500}
              />
            </View>

            <Text
              allowFontScaling={false}
              className="text-xs text-textMuted text-right mb-6"
            >
              {description.length}/500
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSubmit}
              disabled={!description.trim() || isSubmitting}
              className={`py-4 rounded-xl items-center ${description.trim() && !isSubmitting ? "bg-primary" : "bg-primary/50"}`}
            >
              <Text
                allowFontScaling={false}
                className="text-base font-semibold text-white"
              >
                {isSubmitting ? bugReport.submittingButton : bugReport.submitButton}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </Drawer.Content>
    </Drawer>
  );
};