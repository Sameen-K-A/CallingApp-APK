import { Loading } from "@/components/shared/Loading";
import { Header } from "@/components/telecaller/Header";
import { TabBar } from "@/components/telecaller/TabBar";
import { useAuth } from "@/context/AuthContext";
import { Redirect, Slot } from "expo-router";
import { View } from "react-native";

export default function TelecallerLayout() {
  const { isLoading, isProfileComplete, isUser, getTelecallerApprovalStatus } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!isProfileComplete()) {
    return <Redirect href="/(app)/(onboarding)/profile-setup" />;
  }

  if (isUser()) {
    return <Redirect href="/(app)/(user)/home" />;
  }

  return (
    <View className="flex-1 bg-background">
      {getTelecallerApprovalStatus() === "APPROVED" && (
        <Header />
      )}

      <View className="flex-1">
        <Slot />
      </View>

      {getTelecallerApprovalStatus() === "APPROVED" && (
        <TabBar />
      )}
    </View>
  );
}