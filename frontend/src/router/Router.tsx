import { Routes, Route, Navigate } from "react-router-dom";
import Login from "@pages/Login";
import SignUp from "@pages/SignUp";
import ExploreBooks from "@pages/ExploreBooks";
import BookInfo from "@pages/BookInfo";
import ExplorePosts from "@pages/ExplorePosts";
import BookPost from "@pages/BookPost";
import MyPosts from "@pages/MyPosts";
import NewPost from "@pages/NewPost";
import Wishlist from "@pages/Wishlist";
import Profile from "@pages/Profile";
import AiAssistant from "@pages/AiAssistant";
import NotFound from "@pages/NotFound";
import SelectBookForPost from "@pages/SelectBookForPost";
import AppLayout from "./AppLayout";
import PublicLayout from "./layout/PublicLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

const Router = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/posts">
            <Route index element={<ExplorePosts />} />
            <Route path=":id" element={<BookPost />} />
          </Route>
          <Route path="/books">
            <Route index element={<ExploreBooks />} />
            <Route path=":id" element={<BookInfo />} />
          </Route>
          <Route path="/books/select" element={<SelectBookForPost />} />
          <Route path="/post">
            <Route index element={<NewPost />} />
            <Route path="create/:bookId" element={<NewPost />} />
            <Route path="edit/:id" element={<NewPost />} />
          </Route>
          <Route path="/myPosts" element={<MyPosts />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ai-assistant" element={<AiAssistant />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/posts" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;
