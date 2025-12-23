//call layout
import { Loading } from "@/components/shared/Loading";
import { useAuth } from "@/context/AuthContext";
import { Redirect, Stack } from "expo-router";

export default function CallLayout() {
  const { isLoading, isProfileComplete } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!isProfileComplete()) {
    return <Redirect href="/(app)/(onboarding)/profile-setup" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        gestureEnabled: false,
      }}
    />
  );
}