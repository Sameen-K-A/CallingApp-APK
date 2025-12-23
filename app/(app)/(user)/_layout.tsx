// user layout
import { Loading } from "@/components/shared/Loading";
import { Header } from "@/components/user/Header";
import { SideDrawer } from "@/components/user/SideDrawer";
import { TabBar } from "@/components/user/TabBar";
import { useAuth } from "@/context/AuthContext";
import { Redirect, Slot } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function UserLayout() {
  const { isLoading, isProfileComplete, isTelecaller, getTelecallerApprovalStatus } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (isLoading) {
    return <Loading />;
  }

  if (!isProfileComplete()) {
    return <Redirect href="/(app)/(onboarding)/profile-setup" />;
  }

  if (isTelecaller()) {
    const status = getTelecallerApprovalStatus();

    switch (status) {
      case "APPROVED":
        return <Redirect href="/(app)/(telecaller)/dashboard" />;
      case "REJECTED":
        return <Redirect href="/(app)/(telecaller)/rejected" />;
      case "PENDING":
      default:
        return <Redirect href="/(app)/(telecaller)/pending" />;
    }
  }

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <View className="flex-1 bg-background">
      <Header onMenuPress={openDrawer} />

      <View className="flex-1">
        <Slot />
      </View>

      <TabBar onMenuPress={openDrawer} />
      <SideDrawer visible={isDrawerOpen} onClose={closeDrawer} />
    </View>
  );
}