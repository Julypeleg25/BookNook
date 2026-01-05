import { useNavigate } from "react-router-dom";
import {
  AuthService,
  type LoginPayload,
} from "@api/services/authService";
import { ApiError } from "@api/apiError";
import { HttpStatusCode } from "axios";
import useUserStore from "@/state/useUserStore";

export const useAuth = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser, isAuthenticated } = useUserStore();

  const register = async (payload: Register) => {
    try {
      const res = await AuthService.register(payload);

      if (res.accessToken) {
        setIsAuthenticated(true);
        setUser(res.user);
      }

      return res.accessToken || null;
    } catch (error) {
      handleAuthError(error);
      return null;
    }
  };

  const login = async (payload: LoginPayload) => {
    try {
      const res = await AuthService.login(payload); // fixed call

      if (res.accessToken) {
        setIsAuthenticated(true);
        setUser(res.user); // save user info
      }

      return res.accessToken || null;
    } catch (error) {
      handleAuthError(error);
      return null;
    }
  };

  const logout = async () => {
    try {
      const res = await AuthService.logout();

      if (res.status === HttpStatusCode.NoContent) {
        setIsAuthenticated(false);
        setUser({
          avatar: "",
          id: "",
          name: "",
          username: "",
        });
      }
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleAuthError = (error: unknown) => {
    if (error instanceof ApiError) {
      console.error(`Auth error: ${error.message}`);
      if (error.status === HttpStatusCode.Unauthorized) {
        navigate("/login");
      }
    } else {
      console.error("Unexpected error", error);
    }
  };

  return {
    login,
    register,
    logout,
    isAuthenticated,
  };
};
