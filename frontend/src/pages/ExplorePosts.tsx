import { Box } from "@mui/material";
import BookPostCard from "../components/bookCards/BookPostCard";
import { bookPosts } from "../exampleData";
import type { BookPost } from "../models/Book";
import { useState } from "react";
import SearchFiltersModal from "../components/searchFilters/SearchFiltersModal";
import SearchBar from "../components/searchFilters/SearchBar";

const ExplorePosts = () => {
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

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
        {bookPosts.map((post: BookPost) => (
          <BookPostCard key={post.id} book={post} />
        ))}
      </Box>
      <SearchFiltersModal
        open={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
      />
    </div>
  );
};
export default ExplorePosts;
