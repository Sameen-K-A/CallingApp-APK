import { LANGUAGES } from "@/constants/language";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Drawer } from "../ui/drawer";

interface LanguagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedLanguage: string | undefined;
  onSelectLanguage: (languageId: string) => void;
};

export function LanguagePickerModal({ visible, onClose, selectedLanguage, onSelectLanguage }: LanguagePickerModalProps) {
  return (
    <Drawer visible={visible} onClose={onClose}>
      <View className="flex-row items-center justify-between px-6 pb-6 border-b border-mutedForeground/10">
        <Text
          className="text-lg font-bold text-text"
          allowFontScaling={false}
        >
          Select Language
        </Text>
      </View>

      <ScrollView
        className="px-4 py-2"
        showsVerticalScrollIndicator={false}
      >
        {LANGUAGES.map((language) => {
          const isSelected = selectedLanguage === language.id;
          return (
            <TouchableOpacity
              key={language.id}
              activeOpacity={0.7}
              onPress={() => {
                onSelectLanguage(language.id);
                onClose();
              }}
              className={`flex-row items-center p-4 mb-2 rounded-xl border ${isSelected
                ? "border-primary bg-primary/10"
                : "border-transparent"
                }`}
            >
              <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${isSelected ? "border-primary" : "border-border"}`} >
                {isSelected && (
                  <View className="w-3 h-3 rounded-full bg-primary" />
                )}
              </View>

              <Text
                className={`flex-1 text-base ${isSelected ? "text-primary font-semibold" : "text-text"}`}
                allowFontScaling={false}
              >
                {language.name}
              </Text>

              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color="#8B5CF6"
                />
              )}
            </TouchableOpacity>
          );
        })}
        <View className="h-6" />
      </ScrollView>
    </Drawer>
  );
}

export const getLanguageName = (id: string | undefined): string => {
  if (!id) return "";
  return LANGUAGES.find((l) => l.id === id)?.name || "";
};