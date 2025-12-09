import { useAuth } from "@/context/AuthContext";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { isAuthenticated, isLoading, isTelecaller } = useAuth();

  if (isLoading) {
    return null;
  };

  if (isAuthenticated) {
    if (isTelecaller()) {
      return <Redirect href="/(app)/(telecaller)/dashboard" />;
    }
    return <Redirect href="/(app)/(user)/home" />;
  };

  return (
    <Stack screenOptions={{ headerShown: false }} >
      <Stack.Screen name="login" options={{ gestureEnabled: false }} />
      <Stack.Screen name="otp" options={{ gestureEnabled: false }} />
    </Stack>
  );
};