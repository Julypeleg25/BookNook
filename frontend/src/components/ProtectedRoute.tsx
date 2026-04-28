import useUserStore from "@/state/useUserStore";
import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { buildRedirectTarget } from "@/utils/redirects";

interface ProtectedRouteProps {
  children?: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useUserStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: buildRedirectTarget(location) }}
      />
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;