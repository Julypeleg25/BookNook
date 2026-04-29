import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import type { Book } from "@models/Book";
import { useState, useMemo, type ReactNode } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import { useInfiniteLoader } from "@hooks/useInfiniteLoader";
import BookCardSkeleton from "../bookCards/BookCardSkeleton";
import BookInfoCard from "../bookCards/BookInfoCard";

interface WishlistBooksGridProps {
  books: Book[];
  title?: ReactNode;
  loading?: boolean;
  showWishlistRemove?: boolean;
}

const BATCH_SIZE = 4;

const WishlistBooksGrid = ({ books, title, loading, showWishlistRemove }: WishlistBooksGridProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const canExpand = books.length > BATCH_SIZE;

  const { visibleItems, loaderRef, reset } = useInfiniteLoader({
    items: books,
    batchSize: BATCH_SIZE,
    rootMargin: "150px",
  });

  const visibleBooks = useMemo(
    () => (isExpanded ? books : visibleItems),
    [isExpanded, books, visibleItems],
  );

  const toggleExpand = () => {
    setIsExpanded((prev) => {
      if (prev) reset();
      return !prev;
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      {title && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          gap={2}
          flexWrap="wrap"
        >
          {title}

          {canExpand && (
            <Button variant="outlined" onClick={toggleExpand}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <span>
                  {isExpanded ? "view less" : `view all ${books.length}`}
                </span>
                {isExpanded ? <FaArrowUp /> : <FaArrowDown />}
              </Stack>
            </Button>
          )}
        </Stack>
      )}

      {!loading && books.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
          No books in your wishlist yet.
        </Typography>
      ) : (
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4, 1fr)",
          }}
          gap="1.5rem"
          justifyItems="center"
        >
          {loading
            ? [...Array(BATCH_SIZE)].map((_, i) => <BookCardSkeleton key={i} />)
            : visibleBooks.map((book) => (
              <BookInfoCard book={book} key={book.id || book._id} showWishlistRemove={showWishlistRemove} />
            ))}
        </Box>
      )}

      {isExpanded && canExpand && <Box ref={loaderRef} />}
    </Paper>
  );
};

export default WishlistBooksGrid;
