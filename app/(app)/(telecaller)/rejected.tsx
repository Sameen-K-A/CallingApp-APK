import { Avatar } from "@/components/shared/avatars";
import { getLanguageName } from "@/components/shared/LanguagePickerModal";
import { LogoutModal } from "@/components/shared/LogoutModal";
import { ReapplyDrawer } from "@/components/telecaller/ReapplyDrawer";
import { Button, ButtonText } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/utils/formatter";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { router } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SUPPORT_EMAIL = "support@example.com";
const SUPPORT_PHONE = "9000000000";

export default function Rejected() {
  const { user, logout } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showReapplyDrawer, setShowReapplyDrawer] = useState(false);

  if (!user) {
    router.replace("/(auth)/login");
    return null;
  }

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  const handleReapplySuccess = () => {
    setShowReapplyDrawer(false);
    setTimeout(() => {
      router.replace("/(app)/(telecaller)/pending");
    }, 300);
  };

  const initialReapplyData = {
    name: user.name || "",
    dob: user.dob ? new Date(user.dob) : undefined,
    language: user.language || "",
    about: user.telecallerProfile?.about || "",
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={Platform.OS === "ios" ? ["top"] : ["top", "bottom"]}
    >
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View className="flex-row justify-end px-6 py-4">
            <Pressable
              onPress={() => setShowLogoutModal(true)}
              className="flex-row items-center px-4 py-2 bg-red-500/10 rounded-full border border-red-500/20 active:opacity-70"
            >
              <Ionicons name="log-out-outline" size={16} color="#EF4444" />
              <Text
                className="text-red-500 font-medium text-sm ml-1.5"
                allowFontScaling={false}
              >
                Logout
              </Text>
            </Pressable>
          </View>

          <View className="items-center pb-4">
            <View className="relative mb-4">
              <View
                className={`w-28 h-28 rounded-full overflow-hidden items-center justify-center ${user.profile?.startsWith("avatar-") ? "bg-transparent" : "bg-primary/20"}`}
              >
                {user.profile?.startsWith("avatar-") ? (
                  <Avatar avatarId={user.profile!} size={95} />
                ) : (
                  <Text
                    className="text-3xl font-nexaHeavy text-primary"
                    allowFontScaling={false}
                  >
                    {getInitials(user.name)}
                  </Text>
                )}
              </View>

              <View
                className="absolute top-0 left-0 w-28 h-28 rounded-full border-4 border-primary"
                pointerEvents="none"
              />
            </View>

            <Text
              className="text-2xl max-w-xs line-clamp-1 font-nexaHeavy text-text"
              allowFontScaling={false}
            >
              {user.name}
            </Text>

            <Text className="text-base text-textMuted" allowFontScaling={false}>
              +91 {user.phone}
            </Text>
          </View>

          <View className="flex-row justify-center mb-6">
            <View className="flex-row items-center px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
              <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
              <Text
                className="text-red-500 font-semibold text-sm"
                allowFontScaling={false}
              >
                Application Rejected
              </Text>
            </View>
          </View>

          <View className="px-6">
            <View className="mb-6">
              <Text
                className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 ml-1"
                allowFontScaling={false}
              >
                Rejection Reason
              </Text>

              <View className="bg-card rounded-2xl border border-border overflow-hidden p-5">
                <View className="flex-row items-start">
                  <View className="w-12 h-12 rounded-full bg-red-500/10 items-center justify-center">
                    <Ionicons name="close-circle-outline" size={24} color="#EF4444" />
                  </View>
                  <View className="flex-1 ml-4">
                    <Text
                      className="text-lg font-nexaHeavy text-text mb-1"
                      allowFontScaling={false}
                    >
                      Not Approved
                    </Text>
                    <Text
                      className="text-sm text-textMuted leading-5"
                      allowFontScaling={false}
                    >
                      {user.telecallerProfile?.verificationNotes ||
                        "Your application did not meet our requirements. Please update your information and try again."}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="mb-6">
              <Text
                className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 ml-1"
                allowFontScaling={false}
              >
                Submitted Information
              </Text>

              <View className="bg-card rounded-2xl border border-border overflow-hidden">
                <InfoRow
                  icon="person-outline"
                  label="Full Name"
                  value={user.name || "N/A"}
                />
                <Separator />

                <InfoRow
                  icon="call-outline"
                  label="Phone Number"
                  value={`+91 ${user.phone}`}
                />
                <Separator />

                <InfoRow
                  icon="male-female-outline"
                  label="Gender"
                  value={user.gender || "N/A"}
                  capitalize
                />
                <Separator />

                <InfoRow
                  icon="calendar-outline"
                  label="Date of Birth"
                  value={user.dob ? format(new Date(user.dob), "d MMM yyyy") : "N/A"}
                />
                <Separator />

                <InfoRow
                  icon="language-outline"
                  label="Primary Language"
                  value={getLanguageName(user.language) || "N/A"}
                />
                <Separator />

                <InfoRow
                  icon="document-text-outline"
                  label="About"
                  value={user.telecallerProfile?.about || "No description provided"}
                  multiline
                />
              </View>
            </View>

            <View>
              <Text
                className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 ml-1"
                allowFontScaling={false}
              >
                Need Help?
              </Text>

              <View className="bg-card rounded-2xl border border-border overflow-hidden">
                <InfoRow
                  icon="mail-outline"
                  label="Email Support"
                  value={SUPPORT_EMAIL}
                />
                <Separator />
                <InfoRow
                  icon="call-outline"
                  label="Phone Support"
                  value={`+91 ${SUPPORT_PHONE}`}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="px-6 py-4 border-t border-border bg-background">
          <Button
            onPress={() => setShowReapplyDrawer(true)}
            size="lg"
            className="rounded-2xl"
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <ButtonText className="ml-2">Edit & Re-apply</ButtonText>
          </Button>
        </View>
      </View>

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />

      <ReapplyDrawer
        visible={showReapplyDrawer}
        onClose={() => setShowReapplyDrawer(false)}
        onSuccess={handleReapplySuccess}
        initialData={initialReapplyData}
      />
    </SafeAreaView>
  );
}

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  capitalize?: boolean;
  multiline?: boolean;
}

function InfoRow({
  icon,
  label,
  value,
  capitalize = false,
  multiline = false,
}: InfoRowProps) {
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
          numberOfLines={multiline ? 3 : 1}
        >
          {capitalize ? value.toLowerCase() : value}
        </Text>
      </View>
    </View>
  );
}