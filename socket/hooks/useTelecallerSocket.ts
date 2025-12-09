import {
  connectTelecallerSocket,
  isTelecallerSocketConnected,
} from '@/socket/telecaller.socket';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;
let netInfoSubscription: ReturnType<typeof NetInfo.addEventListener> | null = null;

export const useTelecallerSocket = (token: string | null) => {
  const tokenRef = useRef<string | null>(token);
  tokenRef.current = token;

  useEffect(() => {
    if (!token) {
      return;
    }

    if (!isTelecallerSocketConnected()) {
      connectTelecallerSocket(token);
    }

    if (appStateSubscription) {
      return;
    }

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (!tokenRef.current) return;

      if (nextAppState === 'active') {
        if (!isTelecallerSocketConnected() && tokenRef.current) {
          connectTelecallerSocket(tokenRef.current);
        }
      }
    };

    appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    netInfoSubscription = NetInfo.addEventListener((state) => {
      if (!tokenRef.current) return;

      if (state.isConnected && AppState.currentState === 'active') {
        if (!isTelecallerSocketConnected()) {
          connectTelecallerSocket(tokenRef.current);
        }
      }
    });

  }, [token]);
};

export const cleanupTelecallerSocket = () => {
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
  if (netInfoSubscription) {
    netInfoSubscription();
    netInfoSubscription = null;
  }
};