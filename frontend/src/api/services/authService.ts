import {
  AuthResponseDto,
  LoginRequestDTO,
  RegisterRequestDTO,
} from "@shared/dtos/auth.dto";
import { endpoints } from "../endpoints";
import { axiosClient, refreshTokenAxiosClient } from "../axios/axiosClient";
import { UserDto } from "@shared/dtos/user.dto";

export const AuthService = {
  async login(payload: LoginRequestDTO): Promise<AuthResponseDto> {
    const res = await axiosClient.post<AuthResponseDto>(endpoints.auth.login, payload);
    return res.data;
  },

  async register(payload: RegisterRequestDTO | FormData): Promise<AuthResponseDto> {
    const res = await axiosClient.post<AuthResponseDto>(endpoints.auth.register, payload);
    return res.data;
  },

  async refreshToken(): Promise<string> {
    const res = await refreshTokenAxiosClient.post<{ accessToken: string }>(
      endpoints.auth.refresh
    );
    return res.data.accessToken;
  },

  async googleSignIn(credential: string): Promise<AuthResponseDto> {
    const res = await axiosClient.post<AuthResponseDto>(
      endpoints.auth.googleRegister,
      { credential }
    );
    return res.data;
  },

  async logout(): Promise<void> {
    await axiosClient.post(endpoints.auth.logout);
  },

  async getCurrentUser(): Promise<UserDto> {
    const res = await axiosClient.get<UserDto>(endpoints.auth.me);
    return res.data;
  },
};
