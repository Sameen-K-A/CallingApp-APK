import { BasicInfoStep } from "@/components/shared/profile-setup/BasicInfoStep";
import { OtherSteps } from "@/components/shared/profile-setup/OtherSteps";
import { TelecallerStep } from "@/components/shared/profile-setup/TelecallerStep";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button, ButtonText } from "@/components/ui/button";
import { API_CONFIG } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import useErrorHandler from "@/hooks/useErrorHandler";
import { ProfileFormData, profileSchema } from "@/schemas/auth.schema";
import apiClient from "@/services/api.service";
import { ICompleteProfilePayload, ICompleteProfileResponse } from "@/types/api";
import { showToast } from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ActivityIndicator, Keyboard, Text, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const { updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      dob: undefined,
      gender: undefined,
      wantsToBeTelecaller: false,
      about: "",
      language: "",
    },
  });

  const { handleSubmit, watch, trigger, setValue } = methods;

  const watchedGender = watch("gender");
  const wantsToBeTelecaller = watch("wantsToBeTelecaller");
  const isFemale = watchedGender === "female";

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof ProfileFormData)[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ["name", "dob", "gender"];
        break;
      case 2:
        fieldsToValidate = ["wantsToBeTelecaller"];
        break;
      case 3:
        fieldsToValidate = wantsToBeTelecaller ? ["about", "language"] : ["language"];
        break;
    }

    const result = await trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);

    if (!isValid) return;

    if (currentStep === 1) {
      if (isFemale) {
        setCurrentStep(2);
      } else {
        setValue("wantsToBeTelecaller", false);
        setValue("about", "");
        setCurrentStep(3);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const handleBack = () => {
    if (currentStep === 3) {
      if (isFemale) {
        setCurrentStep(2);
      } else {
        setCurrentStep(1);
      }
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const transformToApiPayload = (data: ProfileFormData): ICompleteProfilePayload => {
    return {
      name: data.name.trim(),
      dob: data.dob!.toISOString(),
      gender: data.gender!.toUpperCase() as "MALE" | "FEMALE" | "OTHER",
      role: data.wantsToBeTelecaller ? "TELECALLER" : "USER",
      language: data.language,
      ...(data.wantsToBeTelecaller && { about: data.about?.trim() }),
    };
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const apiPayload = transformToApiPayload(data);
      const { data: response } = await apiClient.patch<ICompleteProfileResponse>(API_CONFIG.ENDPOINTS.COMPLETE_PROFILE, apiPayload);
      await updateUser(response.data);
      showToast(response.message);

      if (data.wantsToBeTelecaller) {
        router.replace("/(app)/(telecaller)/pending");
      } else {
        router.replace("/(app)/(user)/home");
      }
    } catch (error) {
      handleError(error, "Failed to complete profile. Please try again.")
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (currentStep) {
      case 1:
        return "Complete Your Profile";
      case 2:
        return "Join as Telecaller?";
      case 3:
        return wantsToBeTelecaller ? "Almost There!" : "Select Language";
      default:
        return "";
    }
  };

  const getSubtitle = () => {
    switch (currentStep) {
      case 1:
        return "Just a few more details to get you started";
      case 2:
        return "Earn coins by connecting with users through calls";
      case 3:
        return wantsToBeTelecaller
          ? "Tell us about yourself and select your language"
          : "Choose your primary language for conversations";
      default:
        return "";
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep methods={methods} />;
      case 2:
        return <TelecallerStep methods={methods} />;
      case 3:
        return <OtherSteps methods={methods} showAboutSection={wantsToBeTelecaller} />;
      default:
        return null;
    }
  };

  const showBackButton = currentStep > 1;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <AuroraBackground />

        <View className="flex-1">
          <View className="flex-[0.3]" />

          <View className="flex-[0.35] px-6">
            <Text
              allowFontScaling={false}
              className="text-3xl font-bold text-text mb-1"
            >
              {getTitle()}
            </Text>

            <Text
              allowFontScaling={false}
              className="text-base text-textMuted mb-6 leading-6"
            >
              {getSubtitle()}
            </Text>

            <View className="flex-1">
              <FormProvider {...methods}>{renderStep()}</FormProvider>
            </View>
          </View>

          <View className="flex-[0.35] px-6 justify-end">
            <View className="flex-row w-full gap-2">
              {showBackButton && (
                <Button
                  size="lg"
                  variant="secondary"
                  onPress={handleBack}
                  className="flex-1 min-w-[48%] rounded-xl"
                >
                  <ButtonText variant="secondary" className="font-semibold">Back</ButtonText>
                </Button>
              )}

              <Button
                size="lg"
                variant="default"
                onPress={handleNext}
                disabled={isLoading}
                className={`${showBackButton ? "flex-1 min-w-[48%]" : "w-full"} rounded-xl`}
              >
                {isLoading ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator color="#fff" size="small" />
                    <ButtonText variant="default" className="text-base font-semibold">
                      {currentStep === 3 ? "Setting up..." : "Processing..."}
                    </ButtonText>
                  </View>
                ) : (
                  <ButtonText variant="default" className="text-base font-semibold">
                    {currentStep === 3 ? "Let's Start!" : "Next"}
                  </ButtonText>
                )}
              </Button>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}