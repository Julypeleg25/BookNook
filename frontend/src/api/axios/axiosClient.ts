import axios, {
  AxiosError,
  HttpStatusCode,
  type InternalAxiosRequestConfig,
} from "axios";
import env from "@/config/env";
import { mapAxiosError } from "../apiError";
import { AuthService } from "../services/authService";
import { tokenService } from "../services/tokenService";
import useUserStore from "@/state/useUserStore";

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

export const refreshTokenAxiosClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
});


const addBearerToken = (token: string) => `Bearer ${token}`;

let isRefreshing = false;
let unauthorizedRequestsQueue: UnauthorizedRequestQueueItem[] = [];

const resolveQueuedRequests = (error?: Error, token?: string) => {
  unauthorizedRequestsQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  unauthorizedRequestsQueue = [];
};

/* =========================
   REQUEST INTERCEPTOR
========================= */
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenService.getAccess();
    if (token && config.headers) {
      config.headers.Authorization = addBearerToken(token);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
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
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = addBearerToken(token);
          return axiosClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await AuthService.refreshToken();
        tokenService.setAccess(newToken);

        resolveQueuedRequests(undefined, newToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = addBearerToken(newToken);

        return axiosClient(originalRequest);
      } catch (err) {
        tokenService.clear();
        console.log("fffffffffffffffffffffffff");
        const typedError =
          err instanceof Error ? err : new Error("Token refresh failed");
        resolveQueuedRequests(typedError);
        useUserStore.getState().resetUser();
        throw typedError;
      } finally {
        isRefreshing = false;
      }
    }

    throw mapAxiosError(error);
  }
);
