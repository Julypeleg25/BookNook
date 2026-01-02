import { Box, Fab } from "@mui/material";
import BookPostCard from "../components/bookCards/post/BookPostCard";
import { bookPosts } from "../exampleData";
import type { BookPost } from "../models/Book";
import { useState } from "react";
import SearchFiltersModal from "../components/searchFilters/SearchFiltersModal";
import SearchBar from "../components/searchFilters/SearchBar";
import { MdAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useInfiniteLoader } from "../hooks/useInfiniteLoader";

const ExplorePosts = () => {
  const navigate = useNavigate();
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const { visibleItems, loaderRef } = useInfiniteLoader<BookPost>({
    items: bookPosts,
    batchSize: 20,
  });

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
        {visibleItems.map((post: BookPost) => (
          <BookPostCard key={post.id} post={post} />
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
