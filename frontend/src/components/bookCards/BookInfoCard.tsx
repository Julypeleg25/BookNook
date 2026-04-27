import { Box, Typography, Stack, Rating, Button } from "@mui/material";
import type { Book } from "@models/Book";
import { formatDate } from "@utils/dateUtils";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import BookActionsMenu from "./BookActionsMenu";
import React from "react";
import { getAvatarSrcUrl } from "@/utils/userUtils";

interface BookInfoCardProps {
  book: Book;
  isOnlyInfo?: boolean;
  onSelect?: (book: Book) => void;
  listType?: "wish" | "read";
}

const BookInfoCard = ({ book, isOnlyInfo, onSelect, listType }: BookInfoCardProps) => {
  const displayAuthor = book.authors?.length > 0 ? book.authors.join(", ") : "Unknown Author";
  const navigate = useNavigate();

  const handleCreateReview = () => {
    navigate(`/post/create/${book.id}`, { state: { book } });
  };

  const handleSelect = () => {
    onSelect?.(book);
  };

  const isSelectMode = !!onSelect;

  return (
    <Stack alignItems="center" spacing="0.6rem" position="relative">
      {!isSelectMode && (
        <Box sx={{ position: "absolute", top: 4, right: 4, zIndex: 1 }}>
          <BookActionsMenu book={book} listType={listType} />
        </Box>
      )}
      <Box
        {...(!isSelectMode && {
          component: RouterLink,
          to: `/books/${book.id}`,
        })}
        sx={{
          width: "15rem",
          height: "18rem",
          borderRadius: "1rem",
          overflow: "hidden",
          textDecoration: "none",
          boxShadow: 1,
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
          component="img"
          src={getAvatarSrcUrl(book.thumbnail)}
          onError={(e: any) => {
            e.target.src = "https://via.placeholder.com/150*200?text=No+Cover";
          }}
          alt={book.title}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>

      <Stack spacing="0.2rem" width="15rem">
        <Typography
          {...(!isSelectMode && {
            component: RouterLink,
            to: `/books/${book.id}`,
          })}
          sx={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "text.primary",
            textDecoration: "none",
            lineHeight: 1.3,
            transition: "color 0.2s ease",
            ...(!isSelectMode && {
              "&:hover": {
                color: "primary.main",
              },
            }),
          }}
        >
          {book.title}
        </Typography>
        <Typography fontSize="0.85rem">{displayAuthor}</Typography>
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
        {book.ratingCount && book.ratingCount > 0 ? (
          <Stack alignItems="center">
            <Rating
              value={book.avgRating ?? 0}
              precision={0.5}
              readOnly
              size="small"
            />
            <Typography variant="caption" color="text.secondary">
              ({book.avgRating?.toFixed(1)})
            </Typography>
          </Stack>
        ) : null}
        {isOnlyInfo && onSelect && (
          <Button
            variant="contained"
            size="small"
            onClick={handleSelect}
            sx={{ width: "15rem" }}
          >
            Write Review
          </Button>
        )}
        {isOnlyInfo && !onSelect && (
          <Button
            variant="outlined"
            size="small"
            onClick={handleCreateReview}
            sx={{ width: "15rem" }}
          >
            Create Review
          </Button>
        )}
      </div>
    </Stack>
  );
};

export default React.memo(BookInfoCard);
