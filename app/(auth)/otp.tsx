import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button, ButtonText } from "@/components/ui/button";
import { OTPInput } from "@/components/ui/otp-input";
import { API_CONFIG } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { OTPFormData, otpSchema } from "@/schemas/auth.schema";
import apiClient from "@/services/api.service";
import { IVerifyOTPResponse } from "@/types/api";
import { showToast } from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Keyboard, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OTPScreen() {
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);

  const { control, handleSubmit, setError, clearErrors, formState: { errors } } = useForm<OTPFormData>({
    defaultValues: {
      otp: "",
    },
    resolver: zodResolver(otpSchema),
    mode: "onSubmit",
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const onSubmit = async (data: OTPFormData) => {
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const { data: response } = await apiClient.post<IVerifyOTPResponse>(
        API_CONFIG.ENDPOINTS.VERIFY_OTP,
        {
          phone: phoneNumber,
          otp: data.otp,
        }
      );

      await login(response.token, response.user);
      router.replace("/(app)/(user)/home");
    } catch (error: any) {
      setError("otp", {
        type: "manual",
        message: error.message || "Invalid or expired OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;

    Keyboard.dismiss();
    setIsResending(true);
    clearErrors("otp");

    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.RESEND_OTP, {
        phone: phoneNumber,
      });
      showToast(`A new OTP has been sent to ${phoneNumber}.`)
      setTimer(300);
      setCanResend(false);
    } catch (error: any) {
      console.log("❌ Error from resend OTP:", error);
      setError("otp", {
        type: "manual",
        message: error.message || "Failed to resend OTP. Please try again later.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeNumber = () => {
    router.push("/(auth)/login");
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
              className="text-3xl font-bold mb-3"
            >
              Verify OTP
            </Text>

            <Text
              allowFontScaling={false}
              className="text-base text-textMuted mb-8 leading-6"
            >
              Enter the 5-digit code sent to{"\n"}
              <Text
                allowFontScaling={false}
                className="text-text font-semibold"
              >
                {phoneNumber || "+91 **********"}
              </Text>
            </Text>

            <Text
              allowFontScaling={false}
              className="text-sm font-semibold mb-4 tracking-tight"
            >
              Verification Code
            </Text>

            <Controller
              control={control}
              name="otp"
              render={({ field: { onChange } }) => (
                <OTPInput length={5} onChangeText={onChange} />
              )}
            />

            {errors.otp && (
              <Text
                allowFontScaling={false}
                className="text-xs font-bold text-error mt-3 text-center"
              >
                {errors.otp.message}
              </Text>
            )}

            <View className="items-center mt-6">
              {!canResend ? (
                <Text allowFontScaling={false} className="text-sm text-textMuted">
                  Resend code in{" "}
                  <Text
                    allowFontScaling={false}
                    className="text-primary font-semibold"
                  >
                    {formatTime(timer)}
                  </Text>
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                  {isResending ? (
                    <View className="flex-row items-center gap-2">
                      <ActivityIndicator color="#FF7A1A" size="small" />
                      <Text
                        allowFontScaling={false}
                        className="text-sm text-primary font-semibold"
                      >
                        Sending...
                      </Text>
                    </View>
                  ) : (
                    <Text
                      allowFontScaling={false}
                      className="text-sm text-primary font-semibold"
                    >
                      Resend Code
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View className="flex-[0.35] px-6 justify-end">
            <Button
              variant="default"
              size="lg"
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading || canResend}
              className="rounded-xl mb-4 overflow-hidden"
            >
              {isLoading ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator color="#fff" size="small" />
                  <ButtonText
                    allowFontScaling={false}
                    className="text-base font-semibold"
                  >
                    Verifying...
                  </ButtonText>
                </View>
              ) : (
                <ButtonText
                  allowFontScaling={false}
                  className="text-base font-semibold"
                >
                  Verify & Continue
                </ButtonText>
              )}
            </Button>

            <TouchableOpacity onPress={handleChangeNumber} activeOpacity={0.7}>
              <Text
                allowFontScaling={false}
                className="text-sm text-textMuted text-center"
              >
                Wrong number?{" "}
                <Text
                  allowFontScaling={false}
                  className="text-primary font-semibold"
                >
                  Change number
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}