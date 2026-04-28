import { useLocation, useNavigate, type NavigateOptions } from "react-router-dom";
import useUserStore from "@/state/useUserStore";
import { buildRedirectTarget } from "@/utils/redirects";

export const useProtectedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useUserStore();

  const redirectToLogin = () => {
    navigate("/login", {
      replace: true,
      state: { from: buildRedirectTarget(location) },
    });
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
