import useUserStore from "@/state/useUserStore";
import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     await fetchUser();
  //     setLoading(false);
  //   };
  //   checkAuth();
  // }, [fetchUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user ) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
