import { getLanguageName, LanguagePickerModal } from "@/components/shared/LanguagePickerModal";
import { Avatar, AVATAR_IDS } from "@/components/shared/avatars";
import { Input } from "@/components/ui/input";
import { EditTelecallerProfileFormData } from "@/schemas/telecaller.schema";
import { EditUserProfileFormData } from "@/schemas/user.schema";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

type FormData = EditUserProfileFormData | EditTelecallerProfileFormData;

interface EditProfileFormProps {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
  isTelecaller?: boolean;
}

export function EditProfileForm({ control, errors, isTelecaller = false }: EditProfileFormProps) {
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const telecallerErrors = errors as FieldErrors<EditTelecallerProfileFormData>;

  return (
    <View className="mt-3">
      <View className="mb-6">
        <Text
          className="text-sm font-semibold mb-3 text-text"
          allowFontScaling={false}
        >
          Choose Avatar
        </Text>

        <Controller
          control={control}
          name="profile"
          render={({ field: { onChange, value } }) => (
            <View className="flex-row flex-wrap justify-between">
              {AVATAR_IDS.map((avatarId) => (
                <AvatarOption
                  key={avatarId}
                  avatarId={avatarId}
                  isSelected={value === avatarId}
                  onSelect={() => onChange(avatarId)}
                />
              ))}
            </View>
          )}
        />
      </View>

      <View className="mb-5">
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Enter your full name"
              value={value}
              label="Full Name"
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              containerClassName="mb-0"
              error={errors.name?.message}
              className="rounded-xl border border-border"
            />
          )}
        />
      </View>

      <View className="mb-5">
        <Text
          className="text-sm font-semibold mb-2 text-text"
          allowFontScaling={false}
        >
          Primary Language
        </Text>
        <Controller
          control={control}
          name="language"
          render={({ field: { onChange, value } }) => (
            <>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setLanguageModalVisible(true)}
                className="flex-row items-center px-4 py-3.5 rounded-xl border border-border"
              >
                <Ionicons name="language" size={20} color="#6B7280" />
                <Text
                  className={`ml-3 flex-1 text-lg ${value ? "text-text" : "text-textMuted"}`}
                  allowFontScaling={false}
                >
                  {value ? getLanguageName(value) : "Select your language"}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#6B7280" />
              </TouchableOpacity>

              {errors.language && (
                <Text
                  className="text-xs font-bold text-error mt-2 px-1"
                  allowFontScaling={false}
                >
                  {errors.language.message}
                </Text>
              )}

              <LanguagePickerModal
                visible={languageModalVisible}
                onClose={() => setLanguageModalVisible(false)}
                selectedLanguage={value}
                onSelectLanguage={onChange}
              />
            </>
          )}
        />
      </View>

      {isTelecaller && (
        <View className="mb-5">
          <Text
            className="text-sm font-semibold mb-2 text-text"
            allowFontScaling={false}
          >
            About You
          </Text>
          <Controller
            control={control as Control<EditTelecallerProfileFormData>}
            name="about"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <View className="py-2 px-4 rounded-xl border border-border">
                  <TextInput
                    placeholder="Write something about yourself, your interests, hobbies..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    maxLength={500}
                    className="text-text text-base min-h-[100px]"
                    allowFontScaling={false}
                  />
                </View>
                <View className="flex-row justify-between items-center mt-2 px-1">
                  {telecallerErrors.about ? (
                    <Text
                      className="text-xs font-bold text-error flex-1"
                      allowFontScaling={false}
                    >
                      {telecallerErrors.about.message}
                    </Text>
                  ) : (
                    <View className="flex-1" />
                  )}
                  <Text
                    className={`text-xs ${telecallerErrors.about ? "text-error" : "text-textMuted"}`}
                    allowFontScaling={false}
                  >
                    {value?.length || 0}/500
                  </Text>
                </View>
              </>
            )}
          />
        </View>
      )}

      <View className="flex-row items-start bg-warning/10 rounded-xl p-4 mt-2">
        <Ionicons name="information-circle" size={20} color="#F59E0B" />
        <Text
          className="flex-1 ml-3 text-xs text-textMuted leading-5"
          allowFontScaling={false}
        >
          Phone number, date of birth, and gender cannot be changed.
        </Text>
      </View>
    </View>
  );
}

interface AvatarOptionProps {
  avatarId: string;
  isSelected: boolean;
  onSelect: () => void;
}

function AvatarOption({ avatarId, isSelected, onSelect }: AvatarOptionProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onSelect}
      className="relative w-[22%] mb-3"
    >
      <View className={`aspect-square w-full rounded-full overflow-hidden items-center justify-center ${isSelected ? "bg-primary/10" : "bg-background"}`}>
        <Avatar avatarId={avatarId} size={75} />
      </View>

      <View
        className={`absolute top-0 left-0 w-full aspect-square rounded-full border-[3px] ${isSelected ? "border-primary" : "border-border"}`}
        pointerEvents="none"
      />
    </TouchableOpacity>
  );
}