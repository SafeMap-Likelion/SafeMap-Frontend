import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getClerkInstance } from "@clerk/clerk-expo";

const API_BASE_URL = process.env.API_BASE_URL || "https://api.safemap.com/";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

const fetchClerkToken = async (): Promise<string | undefined> => {
  try {
    const clerk = getClerkInstance();

    // Expo-CLERK 공식 권장: 세션 준비인지 체크
    if (!clerk.loaded) {
      await clerk.load();
    }

    const token = await clerk.session?.getToken();
    return token ?? undefined;
  } catch (e) {
    console.warn("fetchClerkToken error", e);
    return undefined;
  }
};

// Request interceptor to add Clerk token to headers
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await fetchClerkToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
