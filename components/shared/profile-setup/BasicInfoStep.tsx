import { Button, ButtonText } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { ProfileFormData } from "@/schemas/auth.schema";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { Platform, Text, TouchableOpacity, View } from "react-native";

interface BasicInfoStepProps {
  methods: UseFormReturn<ProfileFormData>;
}

export function BasicInfoStep({ methods }: BasicInfoStepProps) {
  const { control, formState: { errors } } = methods;
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);
  const [showIOSPicker, setShowIOSPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "Select date";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  };

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);
  const minDate = new Date(1940, 0, 1);

  // Android DateTimePicker handler
  const handleAndroidDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowAndroidPicker(false);

    if (event.type === "set" && selectedDate) {
      methods.setValue("dob", selectedDate);
    }
  };

  // iOS DateTimePicker handler
  const handleIOSDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleConfirmIOSDate = () => {
    if (tempDate) {
      methods.setValue("dob", tempDate);
    }
    setShowIOSPicker(false);
  };

  return (
    <View className="flex-1">
      {/* Name Input */}
      <View className="mb-6">
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

      {/* Date of Birth */}
      <View className="mb-6">
        <Text
          className="text-sm font-semibold mb-2.5 tracking-tight text-text"
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
                className="flex-row items-center px-4 py-4 rounded-xl border border-border"
              >
                <Ionicons name="calendar-outline" size={20} color="#888" />
                <Text
                  className={`ml-3 flex-1 text-lg ${value ? "text-text" : "text-textMuted"}`}
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

              {/* Android DateTimePicker */}
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

              {/* iOS DateTimePicker (in Modal) */}
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

      {/* Gender Selection */}
      <View>
        <Text
          className="text-sm font-semibold mb-2.5 tracking-tight text-text"
          allowFontScaling={false}
        >
          Gender
        </Text>
        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => (
            <>
              <View className="flex-row gap-3">
                {[
                  { id: "male", label: "Male", icon: "male" },
                  { id: "female", label: "Female", icon: "female" },
                  { id: "other", label: "Other", icon: "male-female" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => onChange(item.id)}
                    className={`flex-1 flex-row items-center justify-center py-3.5 rounded-xl border ${value === item.id
                      ? "border-primary bg-primary/10"
                      : "border-border"
                      }`}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={18}
                      color={value === item.id ? "#8B5CF6" : "#6B7280"}
                    />
                    <Text
                      className={`ml-2 font-semibold ${value === item.id ? "text-primary" : "text-textMuted"
                        }`}
                      allowFontScaling={false}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {errors.gender && (
                <Text
                  className="text-xs font-bold text-error mt-2 px-1"
                  allowFontScaling={false}
                >
                  {errors.gender.message}
                </Text>
              )}
            </>
          )}
        />
      </View>
    </View>
  );
}