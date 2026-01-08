import { Navigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import type { JSX } from "@emotion/react/jsx-dev-runtime";
import useUserStore from "@/state/useUserStore";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  // todo what is isauth and how to do together with userstore
  const {user} = useUserStore()

  console.log(user)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
