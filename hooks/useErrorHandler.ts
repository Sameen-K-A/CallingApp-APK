import { useAuth } from '@/context/AuthContext';
import { showErrorToast } from '@/utils/toast';
import { AxiosError } from 'axios';

const useErrorHandler = () => {
  const { logout } = useAuth();

  const handleError = (error: AxiosError | any, fallbackMessage: string = "Something went wrong. Please try again.") => {

    if (error.response?.status === 401) {
      showErrorToast("Session expired! Please login.");
      logout();
      return;
    };

    if (error.response?.status === 403) {
      showErrorToast("Your account has been suspended.");
      logout();
      return;
    };

    if (error.response?.status === 429) {
      showErrorToast("Too many requests. Please try again in a moment.");
      return;
    }

    const backendMessage = error.response?.data?.message || error.message || fallbackMessage;
    showErrorToast(backendMessage);
  };

  return { handleError };
};

export default useErrorHandler;