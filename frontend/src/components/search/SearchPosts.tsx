import { Box, Typography } from "@mui/material";
import PostCardSkeleton from "../bookCards/post/PostCardSkeleton";
import BookPostCard from "@components/bookCards/post/BookPostCard";
import { useState, useMemo } from "react";
import SearchHeader from "./SearchHeader";
import SearchFiltersModal from "@components/searchFilters/SearchFiltersModal";
import { useInfiniteLoader } from "@hooks/useInfiniteLoader";
import { userReviewService } from "@/api/services/userReviewService";
import type { Book, BookPost } from "@models/Book";
import { UserReview, ReviewComment } from "@/models/UserReview";
import { useQuery } from "@tanstack/react-query";
import { useSearchParamsState } from "@/hooks/useSearchParamsState";

const SearchPosts = () => {
  const {
    filters,
    urlQuery,
    localSearchQuery,
    setLocalSearchQuery,
    handleSearch,
    handleApplyFilters,
    handleClear,
    setGenre,
  } = useSearchParamsState();

  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  const {
    data: reviews = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["allReviews", urlQuery, filters],
    queryFn: () =>
      userReviewService.getAllReviews(
        filters.likesAmount,
        urlQuery,
        filters.username,
        filters.rating,
        filters.genre,
      ),
  });

  const hasActiveFilters =
    filters.likesAmount > 0 ||
    filters.rating > 0 ||
    filters.genre.trim().length > 0 ||
    filters.username.trim().length > 0;

  const bookPosts: BookPost[] = useMemo(
    () =>
      reviews.map((r: UserReview) => ({
        id: r._id,
        book: r.book as Book,
        user: {
          id: r.user._id,
          username: r.user.username,
          avatar: r.user.avatar,
        },
        createdDate: r.createdAt,
        description: r.review,
        rating: r.rating,
        imageUrl: r.picturePath,
        likes: r.likes,
        comments: r.comments.map((c: ReviewComment) => ({
          id: c._id,
          user: {
            id: c.user.id,
            username: c.user.username,
            avatar: c.user.avatar,
          },
          createdDate: c.createdAt,
          content: c.comment,
        })),
      })),
    [reviews],
  );

  const { visibleItems, loaderRef } = useInfiniteLoader<BookPost>({
    items: bookPosts,
    batchSize: 20,
  });

  return (
    <Box>
      <SearchHeader
        searchTerm={localSearchQuery}
        setSearchTerm={setLocalSearchQuery}
        onSearch={handleSearch}
        onClear={handleClear}
        onToggleGenre={setGenre}
        selectedGenre={filters.genre}
        setIsFiltersModalOpen={setIsFiltersModalOpen}
        hasActiveFilters={hasActiveFilters}
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
        {isLoading
          ? [...Array(8)].map((_, i) => <PostCardSkeleton key={i} />)
          : visibleItems.map((post: BookPost) => (
            <BookPostCard key={post.id} post={post} />
          ))}
      </Box>

      {!isLoading && bookPosts.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {urlQuery.trim() !== "" ||
              filters.likesAmount > 0 ||
              filters.rating > 0
              ? "No posts found"
              : "No posts yet"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search or filters
          </Typography>
        </Box>
      )}

      {isError && (
        <Typography color="error" sx={{ textAlign: "center", mt: 4 }}>
          Error loading posts. Please try again.
        </Typography>
      )}

      <Box ref={loaderRef} />

      <SearchFiltersModal
        open={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
        mode="posts"
      />
    </Box>
  );
};

export default SearchPosts;
