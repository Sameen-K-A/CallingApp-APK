import {
  connectUserSocket,
  disconnectUserSocket,
  isUserSocketConnected,
} from '@/socket/user.socket';
import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native';

export const useUserSocket = (token: string | null) => {
  const appStateSubRef = useRef<NativeEventSubscription | null>(null);
  const netInfoSubRef = useRef<NetInfoSubscription | null>(null);
  const tokenRef = useRef<string | null>(token);
  const initialNetCheckDone = useRef(false);

  tokenRef.current = token;

  useEffect(() => {
    if (!token) {
      initialNetCheckDone.current = false;
      return;
    }

    // Connect socket immediately
    connectUserSocket(token);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && tokenRef.current) {
        if (!isUserSocketConnected()) {
          console.log('👤 App became active, reconnecting socket');
          connectUserSocket(tokenRef.current);
        }
      }
    };

    const handleNetworkChange = (state: { isConnected: boolean | null }) => {
      // Skip the initial callback from NetInfo
      if (!initialNetCheckDone.current) {
        initialNetCheckDone.current = true;
        return;
      }

      if (state.isConnected && AppState.currentState === 'active' && tokenRef.current) {
        if (!isUserSocketConnected()) {
          console.log('👤 Network restored, reconnecting socket');
          connectUserSocket(tokenRef.current);
        }
      }
    };

    if (!appStateSubRef.current) {
      appStateSubRef.current = AppState.addEventListener('change', handleAppStateChange);
    }

    if (!netInfoSubRef.current) {
      netInfoSubRef.current = NetInfo.addEventListener(handleNetworkChange);
    }

    return () => {
      if (appStateSubRef.current) {
        appStateSubRef.current.remove();
        appStateSubRef.current = null;
      }
      if (netInfoSubRef.current) {
        netInfoSubRef.current();
        netInfoSubRef.current = null;
      }
      initialNetCheckDone.current = false;
    };
  }, [token]);
};

export const cleanupUserSocket = () => {
  disconnectUserSocket();
};