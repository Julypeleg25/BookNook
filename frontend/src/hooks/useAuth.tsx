import { useNavigate } from "react-router-dom";
import { ApiError } from "@api/apiError";
import { HttpStatusCode } from "axios";
import useUserStore from "@/state/useUserStore";
import { AuthService } from "@/api/services/authService";
import { RegisterRequestDTO, LoginRequestDTO } from "@shared/dtos/auth.dto";

export const useAuth = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser, isAuthenticated } = useUserStore();

  const register = async (payload: RegisterRequestDTO) => {
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

  const login = async (payload: LoginRequestDTO) => {
    try {
      const res = await AuthService.login(payload);

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
          email: "",
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
    AuthService
  };
};
