import { useNavigate } from "react-router-dom";
import { ApiError } from "@api/apiError";
import { HttpStatusCode } from "axios";
import useUserStore from "@/state/useUserStore";
import { AuthService } from "@/api/services/authService";
import { RegisterRequestDTO, LoginRequestDTO } from "@shared/dtos/auth.dto";

export const useAuth = () => {
  const navigate = useNavigate();
  const { setUser, resetUser, isAuthenticated } = useUserStore();

  const register = async (payload: RegisterRequestDTO) => {
    try {
      const res = await AuthService.register(payload);

      if (res.status === HttpStatusCode.Created) {
        setUser(res.data);
        navigate("/posts");
      }
    } catch (error) {
      handleAuthError(error);
    }
  };

  const login = async (payload: LoginRequestDTO) => {
    try {
      const res = await AuthService.login(payload);

      if (res.status === HttpStatusCode.Created) {
        setUser(res.data);
        navigate("/posts");
      } else {
        console.error(`Auth error: ${res.status}`);
      }
    } catch (error) {
      handleAuthError(error);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      handleAuthError(error);
    } finally {
      resetUser();
      navigate("/login");
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
    AuthService,
  };
};
