import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { router } from "expo-router";

const API_BASE_URL = process.env.API_BASE_URL || "https://api.safemap.com/";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// request interceptor to add Authorization header

// response interceptor to handle 401 errors
