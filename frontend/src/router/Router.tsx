import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "./AppLayout";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "./AppLayout";
import Explore from "../pages/Explore";
import BookPostDetails from "../pages/BookPost";

const Router = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
      </Route>
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/booksPosts">
          <Route index element={<Explore />} />
          <Route path=":id" element={<BookPostDetails />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;
