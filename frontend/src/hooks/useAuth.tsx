import { useNavigate } from "react-router-dom";
import { ApiError } from "@api/apiError";
import { HttpStatusCode } from "axios";
import useUserStore from "@/state/useUserStore";
import { AuthService } from "@/api/services/authService";
import { RegisterRequestDTO, LoginRequestDTO } from "@shared/dtos/auth.dto";
import { isTokenValid } from "@/utils/authUtils";
import useTokens from "./useTokens";
import { tokenService } from "@/api/services/tokenService";

export const useAuth = () => {
  const navigate = useNavigate();
  const { setUser, resetUser } = useUserStore();
  const { setAccessToken, clearTokens } = useTokens();

  const login = async (payload: LoginRequestDTO) => {
    const res = await AuthService.login(payload);

    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    navigate("/posts");
  };

  const register = async (payload: RegisterRequestDTO) => {
    const res = await AuthService.register(payload);

    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    navigate("/posts");
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } finally {
      clearTokens();
      resetUser();
      navigate("/login");
    }
  };

  const syncUser = async () => {
    const token = tokenService.getAccess();
    console.log('gfgfgfg')
    if (!token) return resetUser();

    try {
      const user = await AuthService.getCurrentUser();
      setUser(user);
    } catch {
      clearTokens();
      resetUser();
    }
  };

  return { login, register, logout, syncUser };
};
