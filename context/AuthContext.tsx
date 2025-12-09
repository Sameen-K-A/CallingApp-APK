import { getUserProfile } from "@/services/api.service";
import { cleanupTelecallerSocket } from "@/socket/hooks/useTelecallerSocket";
import { cleanupUserSocket } from "@/socket/hooks/useUserSocket";
import { disconnectTelecallerSocket } from "@/socket/telecaller.socket";
import { disconnectUserSocket } from "@/socket/user.socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { IAuthUser, ITelecaller, IUser } from "../types/general";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  user: IAuthUser | null;
  token: string | null;
  login: (token: string, userData: IAuthUser) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<IAuthUser>) => Promise<void>;
  refreshUser: () => Promise<IAuthUser | null>;
  isUser: () => boolean;
  isTelecaller: () => boolean;
  isProfileComplete: () => boolean;
  getTelecallerApprovalStatus: () => "PENDING" | "APPROVED" | "REJECTED" | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = "authToken";
const USER_DATA_KEY = "userData";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [user, setUser] = useState<IAuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const fetchAndUpdateUser = useCallback(async (): Promise<IAuthUser | null> => {
    try {
      const freshUserData = await getUserProfile();

      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(freshUserData));
      setUser(freshUserData);

      return freshUserData;
    } catch (error) {
      await clearAuthData();
      throw error
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      await fetchAndUpdateUser();
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAndUpdateUser]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const clearAuthData = async () => {
    cleanupUserSocket();
    cleanupTelecallerSocket();
    disconnectUserSocket();
    disconnectTelecallerSocket();

    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = async (authToken: string, userData: IAuthUser) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(AUTH_TOKEN_KEY, authToken),
        AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData)),
      ]);

      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await clearAuthData();
  };


  const updateUser = async (userData: Partial<IAuthUser>) => {
    if (!user) {
      throw new Error("No user logged in");
    }

    try {
      const updatedUser = { ...user, ...userData } as IAuthUser;
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async (): Promise<IAuthUser | null> => {
    if (!token) {
      return null;
    }

    setIsRefreshing(true);

    try {
      const freshUserData = await fetchAndUpdateUser();
      return freshUserData;
    } finally {
      setIsRefreshing(false);
    }
  };

  const isUser = (): boolean => {
    return !user?.role || user?.role === "USER";
  };

  const isTelecaller = (): boolean => {
    return user?.role === "TELECALLER";
  };

  const isProfileComplete = (): boolean => {
    return !!(user?.name && user?.dob && user?.gender && user?.language && user?.phone);
  };

  const getTelecallerApprovalStatus = (): "PENDING" | "APPROVED" | "REJECTED" | null => {
    if (user?.role === "TELECALLER" && user.telecallerProfile) {
      return user.telecallerProfile.approvalStatus;
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        isRefreshing,
        user,
        token,
        login,
        logout,
        updateUser,
        refreshUser,
        isUser,
        isTelecaller,
        isProfileComplete,
        getTelecallerApprovalStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const checkIsUser = (user: IAuthUser | null): user is IUser => {
  return !user?.role || user?.role === "USER";
};

export const checkIsTelecaller = (user: IAuthUser | null): user is ITelecaller => {
  return user?.role === "TELECALLER";
};