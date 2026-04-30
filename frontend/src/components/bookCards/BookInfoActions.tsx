import { Box, CircularProgress, Tooltip, IconButton } from "@mui/material";
import React from "react";
import { BiBookmark } from "react-icons/bi";
import { TbPencilPlus } from "react-icons/tb";
import { useProtectedNavigation } from "@/hooks/useProtectedNavigation";
import type { Book } from "@/models/Book";
import { useWishlistToggle } from "@/hooks/useWishlistToggle";
import { getBookId } from "@/utils/bookUtils";

interface BookInfoActionsProps {
  book: Book;
}

const BookInfoActions = ({ book }: BookInfoActionsProps) => {
  const { isAuthenticated, navigateProtected, redirectToLogin } = useProtectedNavigation();
  const bookId = getBookId(book);
  const wishlist = useWishlistToggle({
    book,
    enabled: isAuthenticated,
  });

  return (
    <Box sx={{ display: "flex", gap: "1.6rem" }}>
      <Tooltip title={wishlist.isAdded ? "remove from wishlist" : "add to wishlist"}>
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
    </Box>
  );
};

export default React.memo(BookInfoActions);
