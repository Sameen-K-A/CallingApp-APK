import { BugReportDrawer } from "@/components/shared/help/BugReportDrawer";
import { ContactDrawer } from "@/components/shared/help/ContactDrawer";
import { HelpItem } from "@/components/shared/help/HelpItem";
import { PolicyDrawer } from "@/components/shared/help/PolicyDrawer";
import { SectionHeader } from "@/components/shared/help/SectionHeader";
import { HELP_CONTENT } from "@/constants/help";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";

type PolicyType = "privacy" | "payment" | "terms" | null;
type DrawerType = "policy" | "contact" | "bug" | null;

export default function HelpScreen() {
  const [policyType, setPolicyType] = useState<PolicyType>(null);
  const [drawerType, setDrawerType] = useState<DrawerType>(null);

  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const { sections, items } = HELP_CONTENT;

  const openPolicy = (type: PolicyType) => {
    setPolicyType(type);
    setDrawerType("policy");
  };

  const closeDrawer = () => {
    setDrawerType(null);
    setPolicyType(null);
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 bg-muted/50">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-5" />
          <SectionHeader title={sections.getHelp} />

          <HelpItem
            icon="mail-outline"
            title={items.contact.title}
            subtitle={items.contact.subtitle}
            onPress={() => setDrawerType("contact")}
          />

          <HelpItem
            icon="bug-outline"
            title={items.bugReport.title}
            subtitle={items.bugReport.subtitle}
            onPress={() => setDrawerType("bug")}
            iconColor="#EF4444"
            iconBgColor="bg-red-100"
          />

          <View className="h-4" />

          <SectionHeader title={sections.legal} />

          <HelpItem
            icon="shield-checkmark-outline"
            title={items.privacy.title}
            subtitle={items.privacy.subtitle}
            onPress={() => openPolicy("privacy")}
            iconColor="#10B981"
            iconBgColor="bg-green-100"
          />

          <HelpItem
            icon="card-outline"
            title={items.payment.title}
            subtitle={items.payment.subtitle}
            onPress={() => openPolicy("payment")}
            iconColor="#F59E0B"
            iconBgColor="bg-amber-100"
          />

          <HelpItem
            icon="document-text-outline"
            title={items.terms.title}
            subtitle={items.terms.subtitle}
            onPress={() => openPolicy("terms")}
            iconColor="#3B82F6"
            iconBgColor="bg-blue-100"
          />

          <View className="h-4" />

          <SectionHeader title={sections.appInfo} />

          <View className="flex-row items-center py-4 px-4 bg-card rounded-2xl">
            <View className="w-10 h-10 rounded-full bg-muted items-center justify-center mr-4">
              <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
            </View>

            <View className="flex-1">
              <Text
                allowFontScaling={false}
                className="text-base font-semibold text-text"
              >
                {items.appVersion.title}
              </Text>
              <Text
                allowFontScaling={false}
                className="text-sm text-textMuted mt-0.5"
              >
                v{appVersion}
              </Text>
            </View>
          </View>
        </ScrollView>

        <PolicyDrawer
          visible={drawerType === "policy"}
          type={policyType}
          onClose={closeDrawer}
        />

        <ContactDrawer
          visible={drawerType === "contact"}
          onClose={closeDrawer}
        />

        <BugReportDrawer
          visible={drawerType === "bug"}
          onClose={closeDrawer}
        />
      </View>
    </View>
  );
}