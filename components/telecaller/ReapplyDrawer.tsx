import { LanguagePickerModal, getLanguageName } from "@/components/shared/LanguagePickerModal";
import { Button, ButtonText } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { API_CONFIG } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { ReapplyFormData, reapplySchema } from "@/schemas/auth.schema";
import apiClient from "@/services/api.service";
import { IAuthUser } from "@/types/general";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

interface ReapplyDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: {
    name: string;
    dob: Date | undefined;
    language: string;
    about: string;
  };
}

export interface IReapplyAPIResponse {
  success: boolean;
  message: string;
  data: IAuthUser;
}

export const ReapplyDrawer: React.FC<ReapplyDrawerProps> = ({ visible, onClose, onSuccess, initialData }) => {
  const { updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);
  const [showIOSPicker, setShowIOSPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<ReapplyFormData>({
    resolver: zodResolver(reapplySchema),
    mode: "onChange",
    defaultValues: {
      name: initialData.name || "",
      dob: initialData.dob,
      language: initialData.language || "",
      about: initialData.about || "",
    },
  });

  useEffect(() => {
    if (visible) {
      reset({
        name: initialData.name || "",
        dob: initialData.dob,
        language: initialData.language || "",
        about: initialData.about || "",
      });
    }
  }, [visible, initialData]);

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);
  const minDate = new Date(1940, 0, 1);

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "Select date";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  };

  const handleAndroidDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowAndroidPicker(false);
    if (event.type === "set" && selectedDate) {
      setValue("dob", selectedDate);
    }
  };

  const handleIOSDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleConfirmIOSDate = () => {
    if (tempDate) {
      setValue("dob", tempDate);
    }
    setShowIOSPicker(false);
  };

  const onSubmit = async (data: ReapplyFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name.trim(),
        dob: data.dob!.toISOString(),
        language: data.language,
        about: data.about.trim(),
      };

      const response = await apiClient.patch<IReapplyAPIResponse>(API_CONFIG.ENDPOINTS.RE_APPLY_APPLICATION, payload);
      await updateUser(response.data.data);

      onSuccess();
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Drawer visible={visible} onClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6">
          <Text
            allowFontScaling={false}
            className="text-xl font-bold text-text mb-1"
          >
            Edit & Re-apply
          </Text>

          <Text
            allowFontScaling={false}
            className="text-sm text-textMuted mb-6"
          >
            Update your information and submit again
          </Text>

          <View className="mb-4">
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

          <View className="mb-4">
            <Text
              className="text-sm font-semibold mb-2 tracking-tight text-text"
              allowFontScaling={false}
            >
              Date of Birth
            </Text>

            <Controller
              control={control}
              name="dob"
              render={({ field: { value } }) => (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      const initialDate = value || maxDate;
                      setTempDate(initialDate);
                      if (Platform.OS === "ios") {
                        setShowIOSPicker(true);
                      } else {
                        setShowAndroidPicker(true);
                      }
                    }}
                    className={`flex-row items-center px-4 py-3.5 rounded-xl border ${errors.dob ? "border-error" : "border-border"}`}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#888" />
                    <Text
                      className={`ml-3 flex-1 text-base ${value ? "text-text" : "text-textMuted"}`}
                      allowFontScaling={false}
                    >
                      {formatDate(value)}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color="#888" />
                  </TouchableOpacity>

                  {errors.dob && (
                    <Text
                      className="text-xs font-bold text-error mt-2 px-1"
                      allowFontScaling={false}
                    >
                      {errors.dob.message}
                    </Text>
                  )}

                  {showAndroidPicker && Platform.OS === "android" && (
                    <DateTimePicker
                      value={tempDate || maxDate}
                      mode="date"
                      display="calendar"
                      maximumDate={maxDate}
                      minimumDate={minDate}
                      onChange={handleAndroidDateChange}
                    />
                  )}

                  {Platform.OS === "ios" && (
                    <Drawer visible={showIOSPicker} onClose={() => setShowIOSPicker(false)} >
                      <View className="bg-background rounded-t-3xl">
                        <View className="flex-row items-center justify-between px-6 pb-6 border-b border-mutedForeground/10">
                          <Text
                            className="text-sm font-bold text-text"
                            allowFontScaling={false}
                          >
                            Select Date of Birth
                          </Text>
                        </View>

                        <DateTimePicker
                          value={tempDate || maxDate}
                          mode="date"
                          display="spinner"
                          maximumDate={maxDate}
                          minimumDate={minDate}
                          onChange={(_, selectedDate) => handleIOSDateChange(selectedDate)}
                          textColor="#000000"
                          themeVariant="light"
                          style={{ backgroundColor: "transparent" }}
                        />

                        <View className="p-6">
                          <Button onPress={handleConfirmIOSDate} className="rounded-xl">
                            <ButtonText allowFontScaling={false}>Confirm</ButtonText>
                          </Button>
                        </View>
                      </View>
                    </Drawer>
                  )}
                </>
              )}
            />
          </View>

          <View className="mb-4">
            <Text
              className="text-sm font-semibold mb-2 tracking-tight text-text"
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
                    onPress={() => setShowLanguageModal(true)}
                    className={`flex-row items-center px-4 py-3.5 rounded-xl border ${errors.language ? "border-error" : "border-border"}`}
                  >
                    <Ionicons name="language" size={20} color="#6B7280" />
                    <Text
                      className={`ml-3 flex-1 text-base ${value ? "text-text" : "text-textMuted"}`}
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
                    visible={showLanguageModal}
                    onClose={() => setShowLanguageModal(false)}
                    selectedLanguage={value}
                    onSelectLanguage={onChange}
                  />
                </>
              )}
            />
          </View>

          <View className="mb-4">
            <Text
              className="text-sm font-semibold mb-2 tracking-tight text-text"
              allowFontScaling={false}
            >
              About You
            </Text>

            <Controller
              control={control}
              name="about"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <View className={`p-4 rounded-xl border ${errors.about ? "border-error" : "border-border"}`}>
                    <TextInput
                      placeholder="Write something about yourself..."
                      placeholderTextColor="#6B7280"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      maxLength={500}
                      className="text-text text-base min-h-[80px]"
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

          <View className="h-4" />
        </ScrollView>

        <View className="px-6 pb-6 pt-4 border-t border-border bg-background">
          <Button
            onPress={handleSubmit(onSubmit)}
            size="lg"
            disabled={isSubmitting}
            className="rounded-xl"
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <ButtonText className="ml-2">Submitting...</ButtonText>
              </>
            ) : (
              <>
                <Ionicons name="send" size={18} color="#FFFFFF" />
                <ButtonText className="ml-2">Submit Application</ButtonText>
              </>
            )}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Drawer>
  );
};