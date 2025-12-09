import { AccountInfoCard } from "@/components/shared/account/AccountInfoCard";
import { EditProfileForm } from "@/components/shared/account/EditProfileForm";
import { PersonalInfoCard } from "@/components/shared/account/PersonalInfoCard";
import { ProfileHeader } from "@/components/shared/account/ProfileHeader";
import { LogoutModal } from "@/components/shared/LogoutModal";
import { Button, ButtonText } from "@/components/ui/button";
import { API_CONFIG } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import useErrorHandler from "@/hooks/useErrorHandler";
import { EditTelecallerProfileFormData, editTelecallerProfileSchema } from "@/schemas/telecaller.schema";
import apiClient from "@/services/api.service";
import { IEditProfilePayload, IEditProfileResponse } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function Account() {
  const { user, updateUser, logout } = useAuth();

  if (!user) {
    router.replace("/(auth)/login");
    return null;
  };

  const { handleError } = useErrorHandler();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const userForm = useForm<EditTelecallerProfileFormData>({
    resolver: zodResolver(editTelecallerProfileSchema),
    defaultValues: {
      name: user?.name || "",
      language: user?.language || "",
      profile: user?.profile || undefined,
      about: user?.telecallerProfile?.about || ""
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
    const originalAbout = user?.telecallerProfile?.about || ""

    if (watchedValues.name?.trim() !== originalName) {
      changes.name = watchedValues.name?.trim();
    }

    if (watchedValues.language !== originalLanguage) {
      changes.language = watchedValues.language;
    }

    if (watchedValues.profile !== originalProfile) {
      changes.profile = watchedValues.profile || null;
    }

    if (watchedValues.about !== originalAbout) {
      changes.about = watchedValues.about;
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
      about: user?.telecallerProfile?.about || "",
    });
    setIsEditMode(true);
  };

  const handleCancel = () => {
    userForm.reset({
      name: user?.name || "",
      language: user?.language || "",
      profile: user?.profile || undefined,
      about: user?.telecallerProfile?.about || "",
    });
    setIsEditMode(false);
  };

  const handleSubmit = async () => {
    const changedFields = getChangedFields();
    if (!changedFields) return;

    setIsLoading(true);

    try {
      const response = await apiClient.patch<IEditProfileResponse>(API_CONFIG.ENDPOINTS.TELE_EDIT_PROFILE, changedFields);
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
    <View className="bg-background flex-1">
      <KeyboardAwareScrollView
        className="flex-1 bg-muted/50"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
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
              isTelecaller={true}
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
                isTelecaller={true}
                about={user?.telecallerProfile?.about}
              />

              <AccountInfoCard
                accountStatus={user?.accountStatus || "ACTIVE"}
                createdAt={user?.createdAt}
              />
            </>
          )}
        </View>

        {!isEditMode && (
          <View className="px-6 mt-8">
            <Text
              className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 ml-1"
              allowFontScaling={false}
            >
              Logout
            </Text>
            <TouchableOpacity
              className="flex-row items-center p-4 bg-red-50 border border-red-600 rounded-2xl"
              activeOpacity={0.6}
              onPress={() => setShowLogoutModal(true)}
            >
              <View className="w-6 items-center mr-5">
                <Ionicons name="log-out-outline" size={22} color="#dc2626" />
              </View>
              <Text allowFontScaling={false} className="text-base text-red-600">
                Log out
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAwareScrollView>

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={logout}
      />
    </View>
  );
};