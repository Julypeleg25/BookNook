import { useNavigate } from "react-router-dom";
import { ApiError } from "@api/apiError";
import { HttpStatusCode } from "axios";
import useUserStore from "@/state/useUserStore";
import { AuthService } from "@/api/services/authService";
import { RegisterRequestDTO, LoginRequestDTO } from "@shared/dtos/auth.dto";
import { UpdateUserRequestDTO } from "@shared/dtos/user.dto";
import { userService } from "@/api/services/userService";

export const useUserApi = () => {
  const navigate = useNavigate();
  const { setUser, resetUser, isAuthenticated } = useUserStore();

  const updateUser = async (payload: UpdateUserRequestDTO) => {
    try {
      const res = await userService.updateCurrentUser(payload);

      if (res.status === HttpStatusCode.Ok) {
        setUser(res.data.user);
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

    throw error;
  };

  return {
    updateUser,
  };
};
