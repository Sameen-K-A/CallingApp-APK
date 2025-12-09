import { ProfileFormData } from "@/schemas/auth.schema";
import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";

interface TelecallerStepProps {
  methods: UseFormReturn<ProfileFormData>;
}

const interestOptions = [
  {
    id: true,
    title: "Yes, I'm Interested",
    desc: "Start earning by talking to users",
  },
  {
    id: false,
    title: "No, Just Chilling",
    desc: "Continue as a regular user",
  },
];

export function TelecallerStep({ methods }: TelecallerStepProps) {
  const { control, setValue, formState: { errors } } = methods;

  return (
    <View className="flex-1 mt-4">
      <Controller
        control={control}
        name="wantsToBeTelecaller"
        render={({ field: { onChange, value } }) => (
          <>
            <View className="gap-4">
              {interestOptions.map((item) => (
                <TouchableOpacity
                  key={String(item.id)}
                  activeOpacity={0.7}
                  onPress={() => {
                    onChange(item.id);
                    if (!item.id) {
                      setValue("about", "");
                    }
                  }}
                  className={`flex-row items-center p-4 py-7 rounded-xl border ${value === item.id ? "border-primary bg-primary/10" : "border-border"}`}
                >
                  <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${value === item.id ? "border-primary" : "border-border"}`}>
                    {value === item.id && (
                      <View className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </View>

                  <View className="flex-1">
                    <Text
                      className={`font-semibold mb-0.5 ${value === item.id ? "text-primary" : "text-text"}`}
                      allowFontScaling={false}
                    >
                      {item.title}
                    </Text>
                    <Text
                      className="text-xs text-textMuted"
                      allowFontScaling={false}
                    >
                      {item.desc}
                    </Text>
                  </View>

                </TouchableOpacity>
              ))}
            </View>

            {errors.wantsToBeTelecaller && (
              <Text
                className="text-xs font-bold text-error mt-2 px-1"
                allowFontScaling={false}
              >
                {errors.wantsToBeTelecaller.message}
              </Text>
            )}
          </>
        )}
      />
    </View>
  );
}