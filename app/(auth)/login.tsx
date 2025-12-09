import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button, ButtonText } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_CONFIG } from "@/config/api";
import { PhoneFormData, phoneSchema } from "@/schemas/auth.schema";
import apiClient from "@/services/api.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Keyboard, Text, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, setError, formState: { errors } } = useForm<PhoneFormData>({
    defaultValues: {
      phoneNumber: "",
    },
    resolver: zodResolver(phoneSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: PhoneFormData) => {
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.SEND_OTP, {
        phone: data.phoneNumber,
      });

      router.push({
        pathname: "/(auth)/otp",
        params: { phoneNumber: data.phoneNumber },
      });
    } catch (error: any) {
      setError("phoneNumber", {
        type: "manual",
        message: error.message || "Failed to send OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
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
              className="text-3xl font-bold text-text mb-3"
            >
              Welcome
            </Text>

            <Text
              allowFontScaling={false}
              className="text-base text-textMuted mb-8 leading-6"
            >
              Enter your phone number, We will send you a confirmation code
              there
            </Text>

            <Text
              allowFontScaling={false}
              className="text-sm font-semibold mb-3 tracking-tight"
            >
              Phone Number
            </Text>

            <View className="flex-row gap-3">
              <View className="px-4 rounded-xl justify-center items-center border border-border self-start h-14">
                <Text
                  allowFontScaling={false}
                  className="text-lg font-semibold tracking-tight"
                >
                  +91
                </Text>
              </View>

              <View className="flex-1">
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="Mobile number"
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      containerClassName="mb-0"
                      size="default"
                      className="rounded-xl border border-border"
                    />
                  )}
                />

                {errors.phoneNumber && (
                  <Text
                    allowFontScaling={false}
                    className="text-xs font-bold text-error mt-2 px-2"
                  >
                    {errors.phoneNumber.message}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View className="flex-[0.35] px-6 justify-end">
            <Button
              variant="default"
              size="lg"
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="rounded-xl mb-4 overflow-hidden"
            >
              {isLoading ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator color="#fff" size="small" />
                  <ButtonText
                    allowFontScaling={false}
                    className="text-white text-base font-semibold"
                  >
                    Verifying...
                  </ButtonText>
                </View>
              ) : (
                <ButtonText
                  allowFontScaling={false}
                  className="text-base font-semibold"
                >
                  Continue
                </ButtonText>
              )}
            </Button>

            <Text
              allowFontScaling={false}
              className="text-xs text-textMuted text-center leading-5"
            >
              By continuing, you agree to our{" "}
              <Text
                allowFontScaling={false}
                className="text-primary font-semibold"
              >
                Terms of Service
              </Text>
              {"\n"}and{" "}
              <Text
                allowFontScaling={false}
                className="text-primary font-semibold"
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}