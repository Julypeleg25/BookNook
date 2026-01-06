import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "@pages/Login";
import SignUp from "@pages/SignUp";
import ExploreBooks from "@pages/ExploreBooks";
import BookInfo from "@pages/BookInfo";
import ExplorePosts from "@pages/ExplorePosts";
import BookPost from "@pages/BookPost";
import MyPosts from "@pages/MyPosts";
import NewPost from "@pages/NewPost";
import MyLists from "@pages/MyLists";
import Profile from "@pages/Profile";
import NotFound from "@pages/NotFound";
import { useAuth } from "@/hooks/auth/useAuth";
import AppLayout from "./AppLayout";
import PublicLayout from "./layout/PublicLayout";

const Router = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route element={<PublicLayout />}>
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
        <Route path="/posts">
          <Route index element={<ExplorePosts />} />
          <Route path=":id" element={<BookPost />} />
        </Route>

        <Route path="/books">
          <Route index element={<ExploreBooks />} />
          <Route path=":id" element={<BookInfo />} />
        </Route>

        <Route path="/post">
          <Route index element={<NewPost />} />
          <Route path="edit/:id" element={<NewPost />} />
        </Route>

        <Route path="/myPosts" element={<MyPosts />} />
        <Route path="/lists" element={<MyLists />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/posts" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;
