import { Loading } from "@/components/shared/Loading";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, isTelecaller, isProfileComplete, getTelecallerApprovalStatus } = useAuth();
  const [isMinTimeComplete, setIsMinTimeComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMinTimeComplete(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isMinTimeComplete && !isAuthLoading) {
      handleNavigation();
    }
  }, [isMinTimeComplete, isAuthLoading]);

  const handleNavigation = () => {
    // Not authenticated -> Login
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
      return;
    }

    // Authenticated but profile incomplete -> Profile Setup
    if (!isProfileComplete()) {
      router.replace("/(app)/(onboarding)/profile-setup");
      return;
    }

    // Authenticated + Profile complete -> Check role
    if (isTelecaller()) {
      const approvalStatus = getTelecallerApprovalStatus();

      switch (approvalStatus) {
        case "PENDING":
          router.replace("/(app)/(telecaller)/pending");
          break;
        case "REJECTED":
          router.replace("/(app)/(telecaller)/rejected");
          break;
        case "APPROVED":
          router.replace("/(app)/(telecaller)/dashboard");
          break;
        default:
          router.replace("/(app)/(telecaller)/pending");
      }
    } else {
      // Regular user
      router.replace("/(app)/(user)/home");
    }
  };

  return <Loading />;
};