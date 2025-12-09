import { Loading } from "@/components/shared/Loading";
import { useAuth } from "@/context/AuthContext";
import { Redirect, Stack } from "expo-router";

export default function OnboardingLayout() {
  const { isLoading, isProfileComplete, isTelecaller, getTelecallerApprovalStatus } = useAuth();

  if (isLoading) {
    return <Loading />;
  };

  if (isProfileComplete()) {
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
    } else {
      return <Redirect href="/(app)/(user)/home" />;
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
  );
};