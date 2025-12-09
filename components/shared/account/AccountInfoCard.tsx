import { Separator } from "@/components/ui/separator";
import { IAuthUser } from "@/types/general";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import React from "react";
import { Text, View } from "react-native";

type AccountInfoCardProps = Pick<IAuthUser, "accountStatus" | "createdAt">;

export function AccountInfoCard({ accountStatus, createdAt }: AccountInfoCardProps) {
  const isActive = accountStatus === "ACTIVE";

  return (
    <View className="mt-8">
      <Text
        className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 ml-1"
        allowFontScaling={false}
      >
        Account Information
      </Text>

      <View className="bg-card rounded-2xl border border-border overflow-hidden">

        <View className="flex-row items-center px-4 py-4">
          <View className={`w-10 h-10 rounded-full items-center justify-center ${isActive ? "bg-success/10" : "bg-error/10"}`} >
            <Ionicons
              name={isActive ? "shield-checkmark-outline" : "shield-outline"}
              size={20}
              color={isActive ? "#10B981" : "#EF4444"}
            />
          </View>
          <View className="flex-1 ml-3">
            <Text
              className="text-xs text-textMuted mb-0.5"
              allowFontScaling={false}
            >
              Account Status
            </Text>
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full mr-2 ${isActive ? "bg-success" : "bg-error"}`} />
              <Text
                className={`text-base font-semibold ${isActive ? "text-success" : "text-error"}`}
                allowFontScaling={false}
              >
                {isActive ? "Active" : "Suspended"}
              </Text>
            </View>
          </View>
        </View>

        <Separator />

        <View className="flex-row items-center px-4 py-4">
          <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
            <Ionicons name="time-outline" size={20} color="#8B5CF6" />
          </View>
          <View className="flex-1 ml-3">
            <Text
              className="text-xs text-textMuted mb-0.5"
              allowFontScaling={false}
            >
              Member Since
            </Text>
            <Text
              className="text-base font-semibold text-text"
              allowFontScaling={false}
            >
              {createdAt ? format(createdAt, "d MMM yyyy") : "N/A"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}