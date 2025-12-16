import { Camera } from 'expo-camera';
import { Alert, Linking } from 'react-native';
import { showToast } from './toast';

export const checkCallPermissions = async (callType: 'AUDIO' | 'VIDEO'): Promise<boolean> => {
  try {
    // 1. Check Microphone Permission
    const micStatus = await Camera.requestMicrophonePermissionsAsync();

    if (!micStatus.granted) {
      if (!micStatus.canAskAgain) {
        Alert.alert(
          "Permission Required",
          "Microphone access is denied. Please enable it in settings to make calls.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: () => Linking.openSettings() }
          ]
        );
      } else {
        showToast("Microphone permission is required for calls.");
      }
      return false;
    }

    // 2. Check Camera Permission (If Video Call)
    if (callType === 'VIDEO') {
      const camStatus = await Camera.requestCameraPermissionsAsync();

      if (!camStatus.granted) {
        if (!camStatus.canAskAgain) {
          Alert.alert(
            "Permission Required",
            "Camera access is denied. Please enable it in settings for video calls.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Settings", onPress: () => Linking.openSettings() }
            ]
          );
        } else {
          showToast("Camera permission is required for video calls.");
        }
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Permission check failed:", error);
    return false;
  }
};