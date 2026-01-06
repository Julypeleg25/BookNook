import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";
import type { JSX } from "@emotion/react/jsx-dev-runtime";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
