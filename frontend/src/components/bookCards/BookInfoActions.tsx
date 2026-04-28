import { Tooltip, IconButton } from "@mui/material";
import React from "react";
import { BiBookmark } from "react-icons/bi";
import { LuBookCheck } from "react-icons/lu";
import { TbPencilPlus } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ListsService } from "@/api/services/ListsService";
import useUserStore from "@/state/useUserStore";
import { useProtectedNavigation } from "@/hooks/useProtectedNavigation";
import { invalidateBookListCache, setBookListCache } from "@/api/queryCache";
import type { BookListType } from "@/models/List";

interface BookInfoActionsProps {
  bookId: string;
}

const BookInfoActions = ({ bookId }: BookInfoActionsProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUserStore();
  const { isAuthenticated, navigateProtected, redirectToLogin } = useProtectedNavigation();

  const { mutate: addBookToList } = useMutation({
    mutationFn: (listType: BookListType) =>
      ListsService.addBookToList(bookId, listType),
    onSuccess: (data, variables) => {
      setBookListCache(queryClient, user.username, variables, data);
      invalidateBookListCache(queryClient, user.username, variables);
      navigate("/lists");
    },
  });

  return (
    <div style={{ display: "flex", gap: "1.6rem" }}>
      <Tooltip title="add to wish list">
        <IconButton
          size="small"
          onClick={() => {
            if (!isAuthenticated) {
              redirectToLogin();
              return;
            }
            addBookToList("wish");
          }}
        >
          <BiBookmark size={"1.2rem"} />
        </IconButton>
      </Tooltip>
      <Tooltip title="write a review">
        <IconButton
          size="small"
          onClick={() => navigateProtected(`/post/create/${bookId}`)}
        >
          <TbPencilPlus size={"1.3rem"} />
        </IconButton>
      </Tooltip>
      <Tooltip title="add to read list">
        <IconButton
          size="small"
          onClick={() => {
            if (!isAuthenticated) {
              redirectToLogin();
              return;
            }
            addBookToList("read");
          }}
        >
          <LuBookCheck size={"1.2rem"} />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default React.memo(BookInfoActions);
