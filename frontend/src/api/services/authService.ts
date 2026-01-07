import {
  AuthResponseDto,
  LoginRequestDTO,
  RegisterRequestDTO
} from "@shared/dtos/auth.dto";
import { endpoints } from "../endpoints";
import { ApiError } from "../apiError";
import { axiosClient } from "../axios/axiosClient";
import { AxiosResponse } from "axios";
import { UserDto } from "@shared/index";

export const AuthService = {
  async login(payload: LoginRequestDTO): Promise<AxiosResponse<AuthResponseDto>> {
    try {
      const res = await axiosClient.post(endpoints.auth.login, payload);

      return res;
    } catch (err) {
      throw err as ApiError;
    }
  },

  async register(payload: RegisterRequestDTO): Promise<AxiosResponse<AuthResponseDto>> {
    try {
      const res = await axiosClient.post(endpoints.auth.register, payload);

      return res;
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

      return res.data.accessToken;
    } catch (err) {
      throw err as ApiError;
    }
  },

  logout() {
    try {
      return axiosClient.get(endpoints.auth.logout);
    } catch (error) {
      console.error("Logout failed", error);
    }
  },

  async getCurrentUser() : Promise<UserDto>{
     try {
      const res = await axiosClient.get<UserDto>(endpoints.auth.me);
      return res.data;
    } catch (err) {
      throw err as ApiError;
    }
}
}
