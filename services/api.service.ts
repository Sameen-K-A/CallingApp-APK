import { IAuthUser } from "@/types/general";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_CONFIG } from "../config/api";

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("❌ API Error:", error);
    if (error.response) {
      const message = error.response.data?.message || "Something went wrong";
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error("Cannot connect to server"));
    } else {
      return Promise.reject(new Error(error.message));
    }
  }
);

// ===================== API Functions =====================

export const getUserProfile = async (): Promise<IAuthUser> => {
  const response = await apiClient.get<{ success: boolean; data: IAuthUser }>(API_CONFIG.ENDPOINTS.GET_ME);
  return response.data.data;
};

export default apiClient;