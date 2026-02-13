import { Box, Fab, Grow } from "@mui/material";
import { books } from "../exampleData";
import type { Book } from "../models/Book";
import { useState, useRef, useEffect, useMemo } from "react";
import SearchFiltersModal from "../components/searchFilters/SearchFiltersModal";
import SearchBar from "../components/searchFilters/SearchBar";
import BookInfoCard from "../components/bookCards/BookInfoCard";
import { MdAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const BATCH_SIZE = 10;

const ExploreBooks = () => {
  const navigate = useNavigate();
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loaderRef.current || visibleCount >= books.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((v) => Math.min(v + BATCH_SIZE, books.length));
        }
      },
      { rootMargin: "150px" }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [visibleCount]);

  const visibleBooks = useMemo(
    () => books.slice(0, visibleCount),
    [visibleCount]
  );

  return (
    <Box sx={{ p: "1rem", mt: "1.5rem" }}>
      <SearchBar setIsFiltersModalOpen={setIsFiltersModalOpen} />

      <Box
        display="grid"
        mt="2rem"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "1fr 1fr",
          md: "repeat(5, 1fr)",
        }}
        gap="1.5rem"
      >
        {visibleBooks.map((book: Book, i: number) => (
          <Grow in timeout={200 + i * 50} key={book.id}>
            <Box>
              <BookInfoCard key={book.id} book={book} />
            </Box>
          </Grow>
        ))}
      </Box>
      <Box ref={loaderRef} />

      <SearchFiltersModal
        open={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
      />

      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: "1.5rem", right: "1.5rem" }}
        onClick={() => navigate("/post")}
      >
        <MdAdd size={"1.8rem"} />
      </Fab>
    </Box>
  );
};

export default ExploreBooks;
