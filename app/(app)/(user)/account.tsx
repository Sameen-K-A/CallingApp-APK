import { AccountInfoCard } from "@/components/shared/account/AccountInfoCard";
import { EditProfileForm } from "@/components/shared/account/EditProfileForm";
import { PersonalInfoCard } from "@/components/shared/account/PersonalInfoCard";
import { ProfileHeader } from "@/components/shared/account/ProfileHeader";
import { Button, ButtonText } from "@/components/ui/button";
import { API_CONFIG } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import useErrorHandler from "@/hooks/useErrorHandler";
import { EditUserProfileFormData, editUserProfileSchema } from "@/schemas/user.schema";
import apiClient from "@/services/api.service";
import { IEditProfilePayload, IEditProfileResponse } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Platform, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function Account() {
  const { user, updateUser } = useAuth();

  if (!user) {
    router.replace("/(auth)/login");
    return null;
  };

  const { handleError } = useErrorHandler();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form for regular users
  const userForm = useForm<EditUserProfileFormData>({
    resolver: zodResolver(editUserProfileSchema),
    defaultValues: {
      name: user?.name || "",
      language: user?.language || "",
      profile: user?.profile || undefined,
    },
    mode: "onBlur",
  });

  const { control, watch, formState: { errors } } = userForm;
  const watchedValues = watch();

  const getChangedFields = (): IEditProfilePayload | null => {
    const changes: IEditProfilePayload = {};

    const originalName = user?.name || "";
    const originalLanguage = user?.language || "";
    const originalProfile = user?.profile || undefined;

    if (watchedValues.name?.trim() !== originalName) {
      changes.name = watchedValues.name?.trim();
    }

    if (watchedValues.language !== originalLanguage) {
      changes.language = watchedValues.language;
    }

    if (watchedValues.profile !== originalProfile) {
      changes.profile = watchedValues.profile || null;
    }

    if (Object.keys(changes).length === 0) {
      return null;
    }

    return changes;
  };

  const handleEditPress = () => {
    userForm.reset({
      name: user?.name || "",
      language: user?.language || "",
      profile: user?.profile || undefined,
    });
    setIsEditMode(true);
  };

  const handleCancel = () => {
    userForm.reset({
      name: user?.name || "",
      language: user?.language || "",
      profile: user?.profile || undefined,
    });
    setIsEditMode(false);
  };

  const handleSubmit = async () => {
    const changedFields = getChangedFields();
    if (!changedFields) return;

    setIsLoading(true);

    try {
      const response = await apiClient.patch<IEditProfileResponse>(API_CONFIG.ENDPOINTS.EDIT_PROFILE, changedFields);
      await updateUser(response.data.data);
      setIsEditMode(false);
    } catch (error: any) {
      handleError(error, "Failed to save changes.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentProfile = isEditMode ? watchedValues.profile : user?.profile;

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={Platform.OS === "ios" ? 20 : 0}
      extraHeight={120}
    >
      <ProfileHeader
        name={user?.name}
        phone={user?.phone}
        profile={currentProfile}
      />

      <View className="flex-row justify-center mb-6 gap-2">
        {isEditMode ? (
          <>
            <Button
              size="sm"
              onPress={handleCancel}
              variant="outline"
              className="px-5 gap-3 rounded-full"
              disabled={isLoading}
            >
              <Ionicons name="close" size={18} color="#6B7280" />
              <ButtonText variant="outline" className="font-semibold">
                Cancel
              </ButtonText>
            </Button>

            <Button
              size="sm"
              onPress={userForm.handleSubmit(handleSubmit)}
              className="px-5 gap-3 rounded-full"
              disabled={isLoading || !getChangedFields()}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              )}
              <ButtonText className="font-semibold">
                {isLoading ? "Saving..." : "Save Changes"}
              </ButtonText>
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            onPress={handleEditPress}
            className="px-5 gap-3 rounded-full bg-primary/10 border border-primary/20"
          >
            <Ionicons name="pencil" size={16} color="#8B5CF6" />
            <ButtonText className="font-semibold text-primary">
              Edit Profile
            </ButtonText>
          </Button>
        )}
      </View>

      <View className="px-6">
        {isEditMode ? (
          <EditProfileForm
            control={control as any}
            errors={errors}
            isTelecaller={false}
          />
        ) : (
          <>
            <PersonalInfoCard
              name={user?.name}
              phone={user.phone}
              gender={user?.gender}
              dob={user?.dob}
              language={user?.language}
              profile={user?.profile}
              isTelecaller={false}
            />

            <AccountInfoCard
              accountStatus={user?.accountStatus || "ACTIVE"}
              createdAt={user?.createdAt}
            />
          </>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
};