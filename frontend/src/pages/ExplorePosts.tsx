import { Box, Fab, Grow } from "@mui/material";
import BookPostCard from "../components/bookCards/post/BookPostCard";
import { bookPosts, books } from "../exampleData";
import type { BookPost } from "../models/Book";
import { useEffect, useMemo, useRef, useState } from "react";
import SearchFiltersModal from "../components/searchFilters/SearchFiltersModal";
import SearchBar from "../components/searchFilters/SearchBar";
import { MdAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const BATCH_SIZE = 10;

const ExplorePosts = () => {
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

  const visiblePosts = useMemo(
    () => bookPosts.slice(0, visibleCount),
    [visibleCount]
  );

  return (
    <div style={{ padding: "1rem", marginTop: "1.2rem" }}>
      <SearchBar setIsFiltersModalOpen={setIsFiltersModalOpen} />
      <Box
        display="grid"
        marginTop={"3rem"}
        gridTemplateColumns={{
          xs: "1fr",
          sm: "1fr 1fr",
          md: "1fr 1fr 1fr 1fr",
        }}
        gap={"2rem"}
      >
        {visiblePosts.map((post: BookPost, i: number) => (
          <Grow in timeout={200 + i * 50} key={post.id}>
            <Box>
              <BookPostCard key={post.id} post={post} />
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
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        onClick={() => {
          navigate("/post");
        }}
      >
        <MdAdd size={"1.8rem"} />
      </Fab>
    </div>
  );
};
export default ExplorePosts;
