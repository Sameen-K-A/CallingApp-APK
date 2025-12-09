import { getLanguageName } from "@/components/shared/LanguagePickerModal";
import { Separator } from "@/components/ui/separator";
import { IAuthUser } from "@/types/general";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import React from "react";
import { Text, View } from "react-native";

interface PersonalInfoCardProps
  extends Pick<IAuthUser, "name" | "phone" | "gender" | "dob" | "language" | "profile"> {
  isTelecaller?: boolean;
  about?: string;
}

export function PersonalInfoCard({ name, phone, gender, dob, language, profile, isTelecaller = false, about }: PersonalInfoCardProps) {
  return (
    <View className="mt-3">
      <Text
        className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 ml-1"
        allowFontScaling={false}
      >
        Personal Information
      </Text>

      <View className="bg-card rounded-2xl border border-border overflow-hidden">
        <InfoRow icon="person-outline" label="Full Name" value={name || "N/A"} />
        <Separator />

        <InfoRow icon="call-outline" label="Phone Number" value={phone} />
        <Separator />

        <InfoRow
          icon="male-female-outline"
          label="Gender"
          value={gender || "N/A"}
          capitalize
        />
        <Separator />

        <InfoRow
          icon="calendar-outline"
          label="Date of Birth"
          value={dob ? format(dob, "d MMM yyyy") : "N/A"}
        />
        <Separator />

        <InfoRow
          icon="language-outline"
          label="Primary Language"
          value={getLanguageName(language) || "N/A"}
        />

        {isTelecaller && (
          <>
            <Separator />
            <InfoRow
              icon="document-text-outline"
              label="About"
              value={about || "No description provided"}
            />
          </>
        )}
      </View>
    </View>
  );
}

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  capitalize?: boolean;
}

function InfoRow({ icon, label, value, capitalize = false }: InfoRowProps) {
  return (
    <View className="flex-row items-center px-4 py-4">
      <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
        <Ionicons name={icon} size={20} color="#8B5CF6" />
      </View>
      <View className="flex-1 ml-3">
        <Text
          className="text-xs text-textMuted mb-0.5"
          allowFontScaling={false}
        >
          {label}
        </Text>
        <Text
          className={`text-base font-semibold text-text ${capitalize ? "capitalize" : ""}`}
          allowFontScaling={false}
        >
          {capitalize ? value.toLowerCase() : value}
        </Text>
      </View>
    </View>
  );
}