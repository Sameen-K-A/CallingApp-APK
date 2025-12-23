// app/(app)/ layout
import { Loading } from "@/components/shared/Loading";
import { useAuth } from "@/context/AuthContext";
import { useTelecallerSocket } from "@/socket/hooks/useTelecallerSocket";
import { useUserSocket } from "@/socket/hooks/useUserSocket";
import { Redirect, Stack } from "expo-router";

function SocketConnection() {
  const { token, isUser, isTelecaller, isProfileComplete, getTelecallerApprovalStatus } = useAuth();

  const shouldConnectSocket = isProfileComplete();

  useUserSocket(shouldConnectSocket && isUser() ? token : null);
  useTelecallerSocket(shouldConnectSocket && isTelecaller() && getTelecallerApprovalStatus() === "APPROVED" ? token : null);

  return null;
}

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <>
      <SocketConnection />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}