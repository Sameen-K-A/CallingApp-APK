import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button, ButtonText } from "@/components/ui/button";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Keyboard, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FeedbackParams extends Record<string, string | string[]> {
  callId: string;
  participantId: string;
  participantName: string;
  participantProfile: string;
  duration: string;
  callType: string;
  role: string;
  homeRoute: string;
}

export default function Feedback() {
  const router = useRouter();
  const params = useLocalSearchParams<FeedbackParams>();

  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { role } = params;

  const handleGoHome = async () => {
    Keyboard.dismiss();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const defaultHome = role === "TELECALLER"
      ? "/(app)/(telecaller)/dashboard"
      : "/(app)/(user)/home";

    router.replace(defaultHome);
  };

  return (
    <TouchableWithoutFeedback className="flex-1" onPress={Keyboard.dismiss}>
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <AuroraBackground />

        <View className="flex-1">
          <View className="flex-[0.3]" />

          <View className="flex-[0.35] px-6 justify-center">
            <Text
              allowFontScaling={false}
              className="text-xl font-bold text-text mb-1"
            >
              Share your feedback
            </Text>

            <Text
              allowFontScaling={false}
              className="text-sm text-textMuted mb-8 leading-6"
            >
              Your feedback helps us improve (optional)
            </Text>

            <View className="bg-input border border-border rounded-xl overflow-hidden">
              <TextInput
                className="p-4 text-base text-text min-h-[100px]"
                placeholder="How was your experience?"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                allowFontScaling={false}
                textAlignVertical="top"
                value={feedback}
                onChangeText={setFeedback}
                maxLength={500}
              />
            </View>

            <Text
              allowFontScaling={false}
              className="text-xs text-textMuted text-right mt-2"
            >
              {feedback.length}/500
            </Text>
          </View>

          <View className="flex-[0.35] px-6 justify-end">
            <Button
              variant="default"
              size="lg"
              onPress={handleGoHome}
              disabled={isSubmitting}
              className="rounded-xl mb-4 overflow-hidden"
            >
              {isSubmitting ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator color="#fff" size="small" />
                  <ButtonText
                    allowFontScaling={false}
                    className="text-white text-base font-semibold"
                  >
                    Please wait...
                  </ButtonText>
                </View>
              ) : (
                <View className="flex-row items-center gap-2">
                  <Ionicons name="home" size={20} color="#FFFFFF" />
                  <ButtonText
                    allowFontScaling={false}
                    className="text-base font-semibold"
                  >
                    Go Home
                  </ButtonText>
                </View>
              )}
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}