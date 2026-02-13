import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "./AppLayout";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "./AppLayout";
import ExplorePosts from "../pages/ExplorePosts";
import BookPost from "../pages/BookPost";
import ExploreBooks from "../pages/ExploreBooks";
import BookInfo from "../pages/BookInfo";

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
          <Route index element={<ExplorePosts />} />
          <Route path=":id" element={<BookPost />} />
        </Route>
        <Route path="/books">
          <Route index element={<ExploreBooks />} />
          <Route path=":id" element={<BookInfo />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;
