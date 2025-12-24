// app/(app)/ layout
import { Loading } from "@/components/shared/Loading";
import { useAuth } from "@/context/AuthContext";
import { useTelecallerSocket } from "@/socket/hooks/useTelecallerSocket";
import { useUserSocket } from "@/socket/hooks/useUserSocket";
import { Redirect, Stack } from "expo-router";

function SocketConnection() {
  const { token, isUser, isTelecaller, isProfileComplete, getTelecallerApprovalStatus } = useAuth();

  const shouldConnectSocket = isProfileComplete();

  const userToken = shouldConnectSocket && isUser() ? token : null;
  const telecallerToken = shouldConnectSocket && isTelecaller() && getTelecallerApprovalStatus() === "APPROVED" ? token : null;

  useUserSocket(userToken);
  useTelecallerSocket(telecallerToken);

  return null;
}

export default function AppLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Key changes when user ID changes, forcing SocketConnection to remount
  const socketKey = user?._id || 'no-user';

  return (
    <>
      <SocketConnection key={socketKey} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}