import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useUserStore from "@/state/useUserStore";
import { AuthService } from "@/api/services/authService";
import { RegisterRequestDTO, LoginRequestDTO } from "@shared/dtos/auth.dto";
import { tokenService } from "@/api/services/tokenService";
import { DEFAULT_AUTH_REDIRECT, normalizeRedirectTarget } from "@/utils/redirects";

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, resetUser } = useUserStore();
  const redirectTarget = normalizeRedirectTarget(
    (location.state as { from?: unknown } | null)?.from,
    DEFAULT_AUTH_REDIRECT
  );

  const login = async (payload: LoginRequestDTO) => {
    const data = await AuthService.login(payload);

    tokenService.setAccess(data.accessToken);
    setUser(data.user);
    navigate(redirectTarget, { replace: true });
  };

  const register = async (payload: RegisterRequestDTO | FormData) => {
    const data = await AuthService.register(payload);

    tokenService.setAccess(data.accessToken);
    setUser(data.user);
    navigate(redirectTarget, { replace: true });
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } finally {
      tokenService.clear();
      resetUser();
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
    } catch {
      tokenService.clear();
      resetUser();
    }
  }, [resetUser, setUser]);

  return { login, register, logout, syncUser };
};
