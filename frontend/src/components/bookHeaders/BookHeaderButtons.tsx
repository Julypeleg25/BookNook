import { Button, Stack } from "@mui/material";
import { BiBookAdd } from "react-icons/bi";
import { BsBook } from "react-icons/bs";
import { LiaBookmark } from "react-icons/lia";
import { LuBookCheck } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useProtectedNavigation } from "@/hooks/useProtectedNavigation";
import type { Book } from "@/models/Book";
import { useBookListToggle } from "@/hooks/useBookListToggle";
import { getBookId } from "@/utils/bookUtils";

interface BookHeaderProps {
  book: Book;
  isBookPost?: boolean;
}

const BookHeader = ({ book, isBookPost }: BookHeaderProps) => {
  const navigate = useNavigate();
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

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }
    wishlist.toggle();
  };

  const handleAddToReadlist = () => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }
    readlist.toggle();
  };

  const handleProtectedReviewNavigation = () => {
    navigateProtected(`/post/create/${bookId}`, { state: { book } });
  };

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      alignItems={{ xs: "stretch", sm: "center" }}
      justifyContent="flex-end"
      sx={{
        width: { xs: "100%", md: "auto" },
        mt: { xs: 2, md: 0 }
      }}
    >
      {isBookPost ? (
        <Button
          variant="contained"
          onClick={() => navigate(`/books/${bookId}`)}
          startIcon={<BsBook />}
          sx={{ borderRadius: "2rem", px: 3 }}
        >
          Go to book page
        </Button>
      ) : (
        <Button
          variant="contained"
          onClick={handleProtectedReviewNavigation}
          startIcon={<BiBookAdd />}
          sx={{ borderRadius: "2rem", px: 3 }}
        >
          Write a review
        </Button>
      )}

      <Button
        variant="outlined"
        onClick={handleAddToWishlist}
        startIcon={<LiaBookmark />}
        disabled={wishlist.isLoading}
        color={wishlist.isAdded ? "primary" : "inherit"}
        sx={{
          borderRadius: "2rem",
          px: 3,
          minWidth: { xs: "100%", sm: "11.5rem" },
          height: "2.75rem",
          borderColor: wishlist.isAdded ? "primary.main" : "divider",
          bgcolor: wishlist.isAdded ? "action.selected" : "transparent",
        }}
      >
        {wishlist.isAdded ? "In Wishlist" : "Add to Wishlist"}
      </Button>
      <Button
        variant="outlined"
        onClick={handleAddToReadlist}
        startIcon={<LuBookCheck />}
        disabled={readlist.isLoading}
        color={readlist.isAdded ? "primary" : "inherit"}
        sx={{
          borderRadius: "2rem",
          px: 3,
          minWidth: { xs: "100%", sm: "11.5rem" },
          height: "2.75rem",
          borderColor: readlist.isAdded ? "primary.main" : "divider",
          bgcolor: readlist.isAdded ? "action.selected" : "transparent",
        }}
      >
        {readlist.isAdded ? "In Read List" : "Add to Read List"}
      </Button>
    </Stack>
  );
};
export default BookHeader;
