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
          size="small"
          color={wishlist.isAdded ? "primary" : "default"}
          disabled={wishlist.isLoading}
          onClick={() => {
            if (!isAuthenticated) {
              redirectToLogin();
              return;
            }
            wishlist.toggle();
          }}
        >
          {wishlist.isLoading ? <CircularProgress size={18} /> : <BiBookmark size={"1.2rem"} />}
        </IconButton>
      </Tooltip>
      <Tooltip title="write a review">
        <IconButton
          size="small"
          onClick={() => navigateProtected(`/post/create/${bookId}`, { state: { book } })}
        >
          <TbPencilPlus size={"1.3rem"} />
        </IconButton>
      </Tooltip>
      <Tooltip title={readlist.isAdded ? "remove from read list" : "add to read list"}>
        <IconButton
          size="small"
          color={readlist.isAdded ? "primary" : "default"}
          disabled={readlist.isLoading}
          onClick={() => {
            if (!isAuthenticated) {
              redirectToLogin();
              return;
            }
            readlist.toggle();
          }}
        >
          {readlist.isLoading ? <CircularProgress size={18} /> : <LuBookCheck size={"1.2rem"} />}
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default React.memo(BookInfoActions);
