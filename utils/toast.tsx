import { Text, View } from 'react-native';
import Toast, { BaseToastProps, ToastConfig } from 'react-native-toast-message';

const CustomToast = ({ text1, type }: BaseToastProps & { type: string }) => {
  const isError = type === 'error';

  return (
    <View className={`mx-4 px-4 py-2.5 rounded-full mb-10 ${isError ? 'bg-red-500' : 'bg-black'}`}>
      <Text className="text-white text-sm font-medium text-center" allowFontScaling={false}>
        {text1}
      </Text>
    </View>
  );
};

export const toastConfig: ToastConfig = {
  success: (props) => <CustomToast {...props} type="success" />,
  error: (props) => <CustomToast {...props} type="error" />,
};

export const showToast = (message: string) => {
  Toast.show({
    type: 'success',
    text1: message,
    position: 'bottom',
    visibilityTime: 3000,
  });
};

export const showErrorToast = (message: string) => {
  Toast.show({
    type: 'error',
    text1: message,
    position: 'bottom',
    visibilityTime: 3000,
  });
};