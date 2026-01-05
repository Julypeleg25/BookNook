import {
  AuthResponseDto,
  LoginRequestDTO,
  RegisterRequestDTO,
} from "@shared/dtos/auth.dto";
import { endpoints } from "../endpoints";
import { ApiError } from "../apiError";
import { axiosClient } from "../axios/axiosClient";

const ACCESS_TOKEN_KEY = "accessToken";

export const AuthService = {
  async login(payload: LoginRequestDTO): Promise<AuthResponseDto> {
    try {
      const res = await axiosClient.post<AuthResponseDto>(
        endpoints.auth.login,
        payload
      );
      localStorage.setItem(ACCESS_TOKEN_KEY, res.data.accessToken);

      return res.data;
    } catch (err) {
      throw err as ApiError;
    }
  },

  async register(payload: RegisterRequestDTO): Promise<AuthResponseDto> {
    try {
      const res = await axiosClient.post<AuthResponseDto>(
        endpoints.auth.register,
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

  async googleRegister(): Promise<string> {
    try {
      const res = await axiosClient.get(endpoints.auth.googleRegister);
      debugger

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
