import { Avatar } from "@/components/shared/avatars";
import { getLanguageName } from "@/components/shared/LanguagePickerModal";
import { LogoutModal } from "@/components/shared/LogoutModal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/utils/formatter";
import { Ionicons } from "@expo/vector-icons";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SUPPORT_EMAIL = "support@example.com";
const SUPPORT_PHONE = "9000000000";

export default function PendingApproval() {
  const { user, logout, refreshUser, isRefreshing } = useAuth();

  if (!user) {
    router.replace("/(auth)/login");
    return null;
  }

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setShowError(null);
    try {
      const updatedUser = await refreshUser();

      if (updatedUser?.role === "TELECALLER") {
        const status = updatedUser.telecallerProfile?.approvalStatus;

        if (status === "APPROVED") {
          router.replace("/(app)/(telecaller)/dashboard");
        } else if (status === "REJECTED") {
          router.replace("/(app)/(telecaller)/rejected");
        }
      }
    } catch (error: AxiosError | any) {
      setShowError(
        error.response?.data?.message
          ? (error.response?.data?.message as string)
          : "Unable to check status. Please try again."
      );
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={Platform.OS === "ios" ? ["top"] : ["top", "bottom"]}>
      <ScrollView
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

        {/* Profile Header */}
        <View className="items-center pb-4">
          <View className="relative mb-4">
            <View className={`w-28 h-28 rounded-full overflow-hidden items-center justify-center ${user.profile?.startsWith("avatar-") ? "bg-transparent" : "bg-primary/20"}`}>
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

        {/* Status Badge */}
        <View className="flex-row justify-center mb-6">
          <View className="flex-row items-center px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <View className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
            <Text
              className="text-amber-600 font-semibold text-sm"
              allowFontScaling={false}
            >
              Pending Approval
            </Text>
          </View>
        </View>

        <View className="px-6">
          {/* Status Card */}
          <View className="mb-6">
            <Text
              className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 ml-1"
              allowFontScaling={false}
            >
              Application Status
            </Text>

            <View className="bg-card rounded-2xl border border-border overflow-hidden p-5">
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 rounded-full bg-amber-500/10 items-center justify-center">
                  <Ionicons name="time-outline" size={24} color="#f59e0b" />
                </View>
                <View className="flex-1 ml-4">
                  <Text
                    className="text-lg font-nexaHeavy text-text"
                    allowFontScaling={false}
                  >
                    Under Review
                  </Text>
                  <Text
                    className="text-sm text-textMuted"
                    allowFontScaling={false}
                  >
                    We're reviewing your application
                  </Text>
                </View>
              </View>

              <View className="bg-amber-500/5 rounded-xl p-4">
                <View className="flex-row items-center">
                  <Ionicons name="information-circle-outline" size={18} color="#f59e0b" />
                  <Text
                    className="text-sm text-amber-600 ml-2 flex-1"
                    allowFontScaling={false}
                  >
                    Usually takes up to 24 hours. We'll notify you once reviewed.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Submitted Details */}
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

          {/* Support Section */}
          <View className="mb-6">
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

          {/* Error Message */}
          {showError && (
            <View className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex-row items-center">
              <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
              <Text
                className="text-red-500 text-sm font-medium ml-2 flex-1"
                allowFontScaling={false}
              >
                {showError}
              </Text>
              <Pressable onPress={() => setShowError(null)} className="p-1">
                <Ionicons name="close" size={18} color="#EF4444" />
              </Pressable>
            </View>
          )}

          {/* Check Status Button */}
          <Button
            onPress={handleRefresh}
            size="lg"
            disabled={isRefreshing}
            className="rounded-2xl"
          >
            {isRefreshing ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text
                  className="text-white font-semibold ml-2"
                  allowFontScaling={false}
                >
                  Checking...
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
                <Text
                  className="text-white font-semibold ml-2"
                  allowFontScaling={false}
                >
                  Check Status
                </Text>
              </>
            )}
          </Button>
        </View>
      </ScrollView>

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
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

function InfoRow({ icon, label, value, capitalize = false, multiline = false }: InfoRowProps) {
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