import { CircularProgress, Tooltip, IconButton } from "@mui/material";
import React from "react";
import { BiBookmark } from "react-icons/bi";
import { LuBookCheck } from "react-icons/lu";
import { TbPencilPlus } from "react-icons/tb";
import { useProtectedNavigation } from "@/hooks/useProtectedNavigation";
import type { Book } from "@/models/Book";
import { useBookListToggle } from "@/hooks/useBookListToggle";
import { getBookId } from "@/utils/bookUtils";

interface BookInfoActionsProps {
  book: Book;
}

const BookInfoActions = ({ book }: BookInfoActionsProps) => {
  const { isAuthenticated, navigateProtected, redirectToLogin } = useProtectedNavigation();
  const bookId = getBookId(book);
  const wishlist = useBookListToggle({
    book,
    listType: "wish",
    enabled: isAuthenticated,
  });
  const readlist = useBookListToggle({
    book,
    listType: "read",
    enabled: isAuthenticated,
  });

  return (
    <div style={{ display: "flex", gap: "1.6rem" }}>
      <Tooltip title={wishlist.isAdded ? "remove from wish list" : "add to wish list"}>
        <IconButton
          color={wishlist.isAdded ? "primary" : "default"}
          disabled={wishlist.isLoading}
          onClick={() => {
            if (!isAuthenticated) {
              redirectToLogin();
              return;
            }
            wishlist.toggle();
          }}
          sx={{ p: 1 }}
        >
          {wishlist.isLoading ? <CircularProgress size={22} /> : <BiBookmark size={"1.5rem"} />}
        </IconButton>
      </Tooltip>
      <Tooltip title="write a review">
        <IconButton
          onClick={() => navigateProtected(`/post/create/${bookId}`, { state: { book } })}
          sx={{ p: 1 }}
        >
          <TbPencilPlus size={"1.5rem"} />
        </IconButton>
      </Tooltip>
      <Tooltip title={readlist.isAdded ? "remove from read list" : "add to read list"}>
        <IconButton
          color={readlist.isAdded ? "primary" : "default"}
          disabled={readlist.isLoading}
          onClick={() => {
            if (!isAuthenticated) {
              redirectToLogin();
              return;
            }
            readlist.toggle();
          }}
          sx={{ p: 1 }}
        >
          {readlist.isLoading ? <CircularProgress size={22} /> : <LuBookCheck size={"1.5rem"} />}
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default React.memo(BookInfoActions);
