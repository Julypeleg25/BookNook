import { LoginRequestDTO, RegisterRequestDTO } from "@shared/types/auth";
import { endpoints } from "../endpoints";
import { ApiError } from "../apiError";
import { axiosClient } from "../axios/axiosClient";

const ACCESS_TOKEN_KEY = "accessToken";

export const AuthService = {
  async login(payload: LoginRequestDTO): Promise<AuthResponse> {
    try {
      const res = await axiosClient.post<AuthResponse>(
        endpoints.auth.login,
        payload
      );
      localStorage.setItem(ACCESS_TOKEN_KEY, res.data.accessToken);

      return res.data;
    } catch (err) {
      throw err as ApiError;
    }
  },

  async register(payload: RegisterRequestDTO): Promise<AuthResponse> {
    try {
      const res = await axiosClient.post<AuthResponse>(
        endpoints.auth.login,
        payload
      );
      localStorage.setItem(ACCESS_TOKEN_KEY, res.data.accessToken);

      return res.data;
    } catch (err) {
      throw err as ApiError;
    }
  },

  async refreshToken(): Promise<string> {
    try {
      const res = await axiosClient.post<{ accessToken: string }>(
        endpoints.auth.refresh
      );

      return res.data.accessToken;
    } catch (err) {
      throw err as ApiError;
    }
  },

  logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);

    return axiosClient.get(endpoints.auth.logout);
  },
};
