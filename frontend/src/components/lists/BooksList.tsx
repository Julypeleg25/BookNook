import { Box, Button, Stack } from "@mui/material";
import type { Book } from "@models/Book";
import { useState, useMemo, type ReactNode } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import { useInfiniteLoader } from "@hooks/useInfiniteLoader";
import BookCardSkeleton from "../bookCards/BookCardSkeleton";
import BookInfoCard from "../bookCards/BookInfoCard";

interface BooksListProps {
  booksList: Book[];
  title?: ReactNode;
  loading?: boolean;
  listType?: "wish" | "read";
}

const BATCH_SIZE = 4;

const BooksList = ({ booksList, title, loading, listType }: BooksListProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { visibleItems, loaderRef, reset } = useInfiniteLoader({
    items: booksList,
    batchSize: BATCH_SIZE,
    rootMargin: "150px",
  });

  const visibleBooks = useMemo(
    () => (isExpanded ? booksList : visibleItems),
    [isExpanded, booksList, visibleItems],
  );

  const toggleExpand = () => {
    setIsExpanded((prev) => {
      if (prev) reset();
      return !prev;
    });
  };

  return (
    <Box
      sx={{
        p: "1rem",
        mt: "2rem",
        backgroundColor: "background.paper",
        borderRadius: "1rem",
      }}
    >
      {title && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb="1rem"
        >
          {title}

          <Button variant="outlined" onClick={toggleExpand}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <span>
                {isExpanded ? "view less" : `view all ${booksList.length}`}
              </span>
              {isExpanded ? <FaArrowUp /> : <FaArrowDown />}
            </Stack>
          </Button>
        </Stack>
      )}

      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "1fr 1fr",
          md: "repeat(4, 1fr)",
        }}
        gap="1.5rem"
      >
        {loading
          ? [...Array(4)].map((_, i) => <BookCardSkeleton key={i} />)
          : visibleBooks.map((book) => (
            <BookInfoCard book={book} key={book.id} listType={listType} />
          ))}
      </Box>

      {isExpanded && <Box ref={loaderRef} />}
    </Box>
  );
};

export default BooksList;
