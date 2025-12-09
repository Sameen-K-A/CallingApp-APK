import { LanguagePickerModal, getLanguageName } from "@/components/shared/LanguagePickerModal";
import { ProfileFormData } from "@/schemas/auth.schema";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface OtherStepsProps {
  methods: UseFormReturn<ProfileFormData>;
  showAboutSection: boolean;
}

export function OtherSteps({ methods, showAboutSection }: OtherStepsProps) {
  const { control, formState: { errors } } = methods;
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View className="flex-1">
      {showAboutSection && (
        <View className="mb-6">
          <Text
            className="text-sm font-semibold mb-1 tracking-tight text-text"
            allowFontScaling={false}
          >
            About You
          </Text>

          <Controller
            control={control}
            name="about"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <View className="p-4 rounded-xl border border-border">
                  <TextInput
                    placeholder="Write something about yourself, your interests, hobbies..."
                    placeholderTextColor="#6B7280"
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
                  {errors.about ? (
                    <Text
                      className="text-xs font-bold text-error flex-1"
                      allowFontScaling={false}
                    >
                      {errors.about.message}
                    </Text>
                  ) : (
                    <View className="flex-1" />
                  )}
                  <Text
                    className="text-xs text-textMuted"
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

      {/* Language Selection */}
      <View className="mb-6">
        <Text
          className="text-sm font-semibold mb-2.5 tracking-tight text-text"
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
                onPress={() => setModalVisible(true)}
                className={`flex-row items-center px-4 py-4 rounded-xl border ${errors.language ? "border-error" : "border-border"}`}
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
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                selectedLanguage={value}
                onSelectLanguage={onChange}
              />
            </>
          )}
        />
      </View>

      {!showAboutSection && (
        <View className="flex-row items-start bg-primary/10 rounded-xl p-4">
          <Ionicons name="information-circle" size={20} color="#8B5CF6" />
          <Text
            className="flex-1 ml-3 text-xs text-textMuted leading-5"
            allowFontScaling={false}
          >
            This will be your primary language for all conversations. You can
            change it later in settings.
          </Text>
        </View>
      )}
    </View>
  );
};