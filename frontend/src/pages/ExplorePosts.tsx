import { Box, Typography } from "@mui/material";
import BookPostCard from "@components/bookCards/post/BookPostCard";
import { bookPosts } from "../exampleData";
import type { BookPost } from "@models/Book";
import { useState } from "react";
import SearchFiltersModal from "@components/searchFilters/SearchFiltersModal";
import SearchBar from "@components/searchFilters/SearchBar";
import { useInfiniteLoader } from "@hooks/useInfiniteLoader";
import type { ISearchFiltersForm } from "@components/searchFilters/models/SearchFiltersOptions";

const defaultFilters: ISearchFiltersForm = {
  genre: "",
  author: "",
  rating: 0,
  reviewsAmount: 0,
  language: "",
  yearPublishedFrom: "",
  yearPublishedTo: "",
  likesAmount: 0,
};

const ExplorePosts = () => {
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ISearchFiltersForm>(defaultFilters);

  // Filter posts based on search query and filters
  const filteredPosts = bookPosts.filter((post) => {
    // Search by book title or description
    const matchesSearch = searchQuery.trim() === "" ||
      post.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by rating
    const matchesRating = filters.rating === 0 || post.rating >= filters.rating;

    // Filter by likes amount
    const matchesLikes = filters.likesAmount === 0 || post.likes.length >= filters.likesAmount;

    return matchesSearch && matchesRating && matchesLikes;
  });

  const { visibleItems, loaderRef } = useInfiniteLoader<BookPost>({
    items: filteredPosts,
    batchSize: 20,
  });

  const handleSearch = (newSearchTerm: string) => {
    setSearchQuery(newSearchTerm);
  };

  const handleApplyFilters = (data: ISearchFiltersForm) => {
    setFilters(data);
  };

  return (
    <Box sx={{ p: "1rem", mt: "1.5rem" }}>
      <SearchBar
        onSearch={handleSearch}
        searchTerm={searchQuery}
        setSearchTerm={setSearchQuery}
        setIsFiltersModalOpen={setIsFiltersModalOpen}
      />
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
      {visibleItems.length === 0 && searchQuery.trim() !== "" && (
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No posts found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search or filters
          </Typography>
        </Box>
      )}
      <Box ref={loaderRef} />

      <SearchFiltersModal
        open={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
      />
    </Box>
  );
};
export default ExplorePosts;
