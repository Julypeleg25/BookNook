import { Box, Typography } from "@mui/material";
import BookPostCard from "@components/bookCards/post/BookPostCard";
import { useState, useMemo } from "react";
import SearchHeader from "./SearchHeader";
import SearchFiltersModal from "@components/searchFilters/SearchFiltersModal";
import { useInfiniteLoader } from "@hooks/useInfiniteLoader";
import { userReviewService } from "@/api/services/userReviewService";
import type { BookPost } from "@models/Book";
import { useQuery } from "@tanstack/react-query";
import { useSearchParamsState } from "@/hooks/useSearchParamsState";

const defaultFilters = {
    genre: "",
    author: "",
    rating: 0,
    reviewsAmount: 0,
    language: "",
    yearPublishedFrom: "",
    yearPublishedTo: "",
    likesAmount: 0,
    username: "",
};

const SearchPosts = () => {
    const {
        filters,
        urlQuery,
        localSearchQuery,
        setLocalSearchQuery,
        handleSearch,
        handleApplyFilters,
        handleClear,
        setGenre
    } = useSearchParamsState();

    const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

    const { data: reviews = [], isLoading, isError, refetch } = useQuery({
        queryKey: ["allReviews", urlQuery, filters],
        queryFn: () => userReviewService.getAllReviews(
            filters.likesAmount, 
            urlQuery, 
            filters.username,
            filters.rating,
            filters.genre
        ),
    });

    const hasActiveFilters =
        filters.likesAmount > 0 ||
        filters.rating > 0 ||
        filters.genre.trim().length > 0 ||
        filters.username.trim().length > 0;

    // Map backend UserReview to frontend BookPost
    const bookPosts: BookPost[] = useMemo(() => reviews.map((r: any) => ({
        id: r._id,
        book: r.book,
        user: r.user,
        createdDate: r.createdDate,
        description: r.review,
        rating: r.rating,
        imageUrl: r.picturePath,
        likes: r.likes,
        comments: r.comments.map((c: any) => ({
            id: c._id,
            user: c.user,
            createdDate: c.createdAt,
            content: c.comment
        })),
    })), [reviews]);

    const filteredPosts = useMemo(() => bookPosts.filter((post) => {
        const matchesRating = filters.rating === 0 || post.rating >= filters.rating;
        const matchesGenre = filters.genre === "" || (post.book.genres ?? []).includes(filters.genre as any);
        return matchesRating && matchesGenre;
    }), [bookPosts, filters.rating, filters.genre]);

    const { visibleItems, loaderRef } = useInfiniteLoader<BookPost>({
        items: filteredPosts,
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
                {visibleItems.map((post: BookPost) => (
                    <BookPostCard key={post.id} post={post} />
                ))}
            </Box>

            {isLoading && (
                <Typography sx={{ textAlign: "center", mt: 4 }}>Loading posts...</Typography>
            )}

            {!isLoading && visibleItems.length === 0 && (
                <Box sx={{ textAlign: "center", mt: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        {urlQuery.trim() !== "" || filters.likesAmount > 0 || filters.rating > 0 ? "No posts found" : "No posts yet"}
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
