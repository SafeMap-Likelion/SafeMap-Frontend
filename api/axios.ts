import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getClerkInstance } from "@clerk/clerk-expo";

// const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_BASE_URL = "http://192.168.0.17:8000/";
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

const fetchClerkToken = async (): Promise<string | undefined> => {
  try {
    const clerk = getClerkInstance();

    // Expo-Clerk 권장
    if (!clerk.loaded) {
      await clerk.load();
    }

    const session = clerk.session;
    if (!session) return undefined;

    const sessionToken = await session.getToken();
    return sessionToken ?? undefined;
  } catch (e) {
    console.warn("fetchClerkToken error", e);
    return undefined;
  }
};

// Request interceptor to add Clerk token to headers
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await fetchClerkToken();
    console.log("Clerk Token:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Request Config:", config);
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
