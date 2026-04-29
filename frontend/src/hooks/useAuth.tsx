import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "@/state/useUserStore";
import { AuthService } from "@/api/services/authService";
import { RegisterRequestDTO, LoginRequestDTO } from "@shared/dtos/auth.dto";
import { tokenService } from "@/api/services/tokenService";
import { useQueryClient } from "@tanstack/react-query";
import {
  clearAuthScopedQueries,
  invalidateAuthReviewState,
} from "@/api/queryCache";

const AUTH_SUCCESS_ROUTE = "/posts";

export const useAuth = () => {
  const navigate = useNavigate();
  const { setUser, resetUser } = useUserStore();
  const queryClient = useQueryClient();

  const login = async (payload: LoginRequestDTO) => {
    const data = await AuthService.login(payload);

    tokenService.setAccess(data.accessToken);
    setUser(data.user);
    invalidateAuthReviewState(queryClient);
    navigate(AUTH_SUCCESS_ROUTE, { replace: true });
  };

  const register = async (payload: RegisterRequestDTO | FormData) => {
    const data = await AuthService.register(payload);

    tokenService.setAccess(data.accessToken);
    setUser(data.user);
    invalidateAuthReviewState(queryClient);
    navigate(AUTH_SUCCESS_ROUTE, { replace: true });
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } finally {
      tokenService.clear();
      resetUser();
      clearAuthScopedQueries(queryClient);
      navigate("/login");
    }
  };

  const syncUser = useCallback(async () => {
    const token = tokenService.getAccess();

    if (!token) {
      resetUser();
      return;
    }

    try {
      const user = await AuthService.getCurrentUser();
      setUser(user);
      invalidateAuthReviewState(queryClient);
    } catch {
      tokenService.clear();
      resetUser();
      clearAuthScopedQueries(queryClient);
    }
  }, [queryClient, resetUser, setUser]);

  return { login, register, logout, syncUser };
};
