import { useNavigate, type NavigateOptions } from "react-router-dom";
import useUserStore from "@/state/useUserStore";

export const useProtectedNavigation = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();

  const redirectToLogin = () => {
    navigate("/login", { replace: true });
  };

  const navigateProtected = (
    to: string,
    options?: NavigateOptions
  ): boolean => {
    if (!isAuthenticated) {
      redirectToLogin();
      return false;
    }

    navigate(to, options);
    return true;
  };

  return {
    isAuthenticated,
    navigateProtected,
    redirectToLogin,
  };
};
