import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, fetchUser } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await fetchUser();
      setLoading(false);
    };
    checkAuth();
  }, [fetchUser]);

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  if (!user ) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
