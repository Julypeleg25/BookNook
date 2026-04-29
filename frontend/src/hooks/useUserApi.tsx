import { useNavigate } from "react-router-dom";
import { ApiError } from "@api/apiError";
import { HttpStatusCode } from "axios";
import useUserStore from "@/state/useUserStore";
import { userService, type UpdateCurrentUserPayload } from "@/api/services/userService";
import { useQueryClient } from "@tanstack/react-query";
import { syncUpdatedUserInReviewCaches } from "@/api/queryCache";

export const useUserApi = () => {
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const queryClient = useQueryClient();

  const updateUser = async (payload: UpdateCurrentUserPayload) => {
    try {
      const res = await userService.updateCurrentUser(payload);

      setUser(res.user);
      syncUpdatedUserInReviewCaches(queryClient, res.user);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleAuthError = (error: unknown) => {
    if (error instanceof ApiError) {
      console.error(`Auth error: ${error.message}`);
      if (error.status === HttpStatusCode.Unauthorized) {
        navigate("/login", { replace: true });
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
