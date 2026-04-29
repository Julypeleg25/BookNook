import { Box, Typography, Stack, Button } from "@mui/material";
import type { Book } from "@models/Book";
import { formatDate } from "@utils/dateUtils";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import BookActionsMenu from "./BookActionsMenu";
import React from "react";
import { getAvatarSrcUrl } from "@/utils/userUtils";
import { getBookId } from "@/utils/bookUtils";

const BOOK_COVER_FALLBACK_URL = "https://via.placeholder.com/150x200?text=No+Cover";

interface BookInfoCardProps {
  book: Book;
  isOnlyInfo?: boolean;
  onSelect?: (book: Book) => void;
  showWishlistRemove?: boolean;
  hideMenu?: boolean;
}

const BookInfoCard = ({ book, isOnlyInfo, onSelect, showWishlistRemove, hideMenu }: BookInfoCardProps) => {
  const displayAuthor = book.authors?.length > 0 ? book.authors.join(", ") : "Unknown Author";
  const navigate = useNavigate();
  const bookId = getBookId(book);

  const handleCreateReview = () => {
    navigate(`/post/create/${bookId}`, { state: { book } });
  };

  const isSelectMode = !!onSelect;
  const handleWriteReview = () => {
    if (onSelect) {
      onSelect(book);
      return;
    }

    handleCreateReview();
  };

  return (
    <Stack alignItems="center" spacing="0.6rem" position="relative">
      <Box
        sx={{
          width: "15rem",
          height: "18rem",
          borderRadius: "1rem",
          overflow: "hidden",
          boxShadow: 1,
          position: "relative",
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
          ...(!isSelectMode && {
            "&:hover": {
              boxShadow: 6,
              transform: "translateY(-0.2rem)",
            },
          }),
        }}
      >
        <Box
          {...(!isSelectMode && {
            component: RouterLink,
            to: `/books/${bookId}`,
          })}
          sx={{
            display: "block",
            width: "100%",
            height: "100%",
            textDecoration: "none",
          }}
        >
          <Box
            component="img"
            src={getAvatarSrcUrl(book.thumbnail)}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              e.currentTarget.src = BOOK_COVER_FALLBACK_URL;
            }}
            alt={book.title}
            loading="lazy"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </Box>
        {!isSelectMode && !hideMenu && (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              right: 18,
              zIndex: 1,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <BookActionsMenu book={book} showWishlistRemove={showWishlistRemove} />
          </Box>
        )}
      </Box>

      <Stack spacing="0.2rem" width="15rem">
        <Typography
          {...(!isSelectMode && {
            component: RouterLink,
            to: `/books/${bookId}`,
          })}
          sx={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "text.primary",
            textDecoration: "none",
            lineHeight: 1.3,
            minHeight: "2.6rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            transition: "color 0.2s ease",
            ...(!isSelectMode && {
              "&:hover": {
                color: "primary.main",
              },
            }),
          }}
          title={book.title}
        >
          {book.title}
        </Typography>
        <Typography
          fontSize="0.85rem"
          title={displayAuthor}
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayAuthor}
        </Typography>
        <Typography fontSize="0.85rem" color="text.secondary">
          {book.publishedDate ? formatDate(book.publishedDate) : "Unknown Date"}
        </Typography>
      </Stack>

      <div
        style={{
          display: "grid",
          justifyItems: "center",
          gap: "0.5rem",
          width: "100%",
        }}
      >
        {isOnlyInfo && (
          <Button
            variant="contained"
            size="small"
            onClick={handleWriteReview}
            sx={{ width: "15rem" }}
          >
            Write Review
          </Button>
        )}
      </div>
    </Stack>
  );
};

export default React.memo(BookInfoCard);
