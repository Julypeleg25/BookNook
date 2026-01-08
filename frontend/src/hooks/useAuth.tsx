import { useNavigate } from "react-router-dom";
import { ApiError } from "@api/apiError";
import { HttpStatusCode } from "axios";
import useUserStore from "@/state/useUserStore";
import { AuthService } from "@/api/services/authService";
import { RegisterRequestDTO, LoginRequestDTO } from "@shared/dtos/auth.dto";
import { isTokenValid } from "@/utils/authUtils";

export const useAuth = () => {
  const navigate = useNavigate();
  const { setUser, resetUser, isAuthenticated , user} = useUserStore();

const syncUser = async () => {
  let token = localStorage.getItem("accessToken");

  // 1. If token is invalid/expired, try to refresh
  if (!isTokenValid(token)) {
    
      try {
        console.log("Access token expired, attempting refresh...");
        const accessToken = await AuthService.refreshToken();
        
        localStorage.setItem("accessToken", accessToken);
      } catch (refreshError) {
        console.error("Refresh failed, logging out");
        handleAuthCleanup();
        return;
      }
    } else {
      handleAuthCleanup();
      return;
    }

  // 2. Now that we have a valid token (either original or new), fetch the user profile
  if (!user.id) {
    try {
      const currentUser = await AuthService.getCurrentUser();
      console.log('setUser', currentUser)
      setUser(currentUser);
      navigate('/posts')
    } catch (error) {
      handleAuthCleanup();
    }
  }

}

// Helper to keep code clean
const handleAuthCleanup = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};
  const register = async (payload: RegisterRequestDTO) => {
    try {
      const res = await AuthService.register(payload);

      if (res.status === HttpStatusCode.Created) {
        setUser(res.data.user);
        localStorage.setItem("accessToken", res.data.accessToken)
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
        setUser(res.data.user);
        localStorage.setItem("accessToken", res.data.accessToken)
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

    throw error;
  };

  return {
    login,
    register,
    logout,
    isAuthenticated,
    AuthService,
    syncUser
  };
};
