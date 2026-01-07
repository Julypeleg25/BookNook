import axios, {
  AxiosError,
  HttpStatusCode,
  type InternalAxiosRequestConfig,
} from "axios";
import env from "@/config/env";
import { mapAxiosError } from "../apiError";
import { AuthService } from "../services/authService";

const API_TIMEOUT = 15_000;

interface UnauthorizedRequestQueueItem {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

export const axiosClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
});

const addBearerToken = (token: string) => `Bearer ${token}`;

let isRefreshing = false;
let unauthorizedRequestsQueue: UnauthorizedRequestQueueItem[] = [];

const handleUnauthorizedRequests = (error?: Error, token?: string) => {
  unauthorizedRequestsQueue.forEach((queueItem) => {
    if (error) queueItem.reject(error);
    else if (token) queueItem.resolve(token);
  });
  unauthorizedRequestsQueue = [];
};

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    console.log('gfgfgfgf')
    if (token && config.headers) {
      config.headers.Authorization = addBearerToken(token);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === HttpStatusCode.Unauthorized &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          unauthorizedRequestsQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers)
            originalRequest.headers.Authorization = addBearerToken(token);
          return axiosClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken: string = await AuthService.refreshToken();
        localStorage.setItem("accessToken", newToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = addBearerToken(newToken);
        handleUnauthorizedRequests(undefined, newToken);

        return axiosClient(originalRequest);
      } catch (err) {
        const typedError =
          err instanceof Error ? err : new Error("Token refresh failed");
        handleUnauthorizedRequests(typedError);

        return Promise.reject(typedError);
      } finally {
        isRefreshing = false;
      }
    }

    throw mapAxiosError(error);
  }
);
