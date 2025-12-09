import { useAuth } from '@/context/AuthContext';
import { AxiosError } from 'axios';

const useErrorHandler = () => {
  const { logout } = useAuth();

  const handleError = (error: AxiosError | any, fallbackMessage: string = "Something went wrong. Please try again.") => {

    if (error.response?.status === 401) {
      logout();
      return;
    };

    if (error.response?.status === 403) {
      // Account suspended.
      logout();
      return;
    };

    if (error.response?.status === 429) {
      // Too many requests. Please try again in a moment.
      return;
    }

    const backendMessage = error.response?.data?.message || error.message || fallbackMessage;
    console.log("backend error message is : ", backendMessage);
  };

  return { handleError };
};

export default useErrorHandler;