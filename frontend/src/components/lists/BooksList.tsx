import { Box, Button, Stack, Grow } from "@mui/material";
import type { Book } from "../../models/Book";
import BookInfoCard from "../bookCards/BookInfoCard";
import { useState, useMemo, useRef, useEffect, type ReactNode } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";

interface BooksListProps {
  booksList: Book[];
  title?: ReactNode;
}

const BATCH_SIZE = 4;

const BooksList = ({ booksList, title }: BooksListProps) => {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!loaderRef.current || visibleCount >= booksList.length || !isExpanded)
      return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((v) => Math.min(v + BATCH_SIZE, booksList.length));
        }
      },
      { rootMargin: "150px" }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [visibleCount, booksList.length, isExpanded]);

  const visibleBooks = useMemo(() => {
    const count = isExpanded ? booksList.length : visibleCount;
    return booksList.slice(0, count);
  }, [booksList, visibleCount, isExpanded]);

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
          {booksList.length > BATCH_SIZE && (
            <Button
              variant="outlined"
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <span>
                  {isExpanded ? "View less" : `View all ${booksList.length}`}
                </span>
                {isExpanded ? <FaArrowUp /> : <FaArrowDown />}
              </Stack>
            </Button>
          )}
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
        {visibleBooks.map((book, i) => (
          <Grow in timeout={200 + i * 50} key={book.id}>
            <Box>
              <BookInfoCard book={book} />
            </Box>
          </Grow>
        ))}
      </Box>
      <Box ref={loaderRef} />
    </Box>
  );
};

export default BooksList;
