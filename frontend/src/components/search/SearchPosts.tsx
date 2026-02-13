import { Box, Typography } from "@mui/material";
import BookPostCard from "@components/bookCards/post/BookPostCard";
import { useState, useEffect } from "react";
import SearchFiltersModal from "@components/searchFilters/SearchFiltersModal";
import SearchBar from "@components/searchFilters/SearchBar";
import { useInfiniteLoader } from "@hooks/useInfiniteLoader";
import type { ISearchFiltersForm } from "@components/searchFilters/models/SearchFiltersOptions";
import { userReviewService, UserReview } from "@/api/services/userReviewService";
import type { BookPost } from "@models/Book";
import { useQuery } from "@tanstack/react-query";

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

const SearchPosts = () => {
    const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<ISearchFiltersForm>(defaultFilters);

    const { data: reviews = [], isLoading, isError, refetch } = useQuery({
        queryKey: ["allReviews", filters.likesAmount, searchQuery],
        queryFn: () => userReviewService.getAllReviews(filters.likesAmount, searchQuery),
    });

    // Map backend UserReview to frontend BookPost
    const bookPosts: BookPost[] = reviews.map((r: any) => ({
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
    }));

    const filteredPosts = bookPosts.filter((post) => {
        const matchesRating = filters.rating === 0 || post.rating >= filters.rating;
        return matchesRating;
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
        <Box>
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

            {isLoading && (
                <Typography sx={{ textAlign: "center", mt: 4 }}>Loading posts...</Typography>
            )}

            {!isLoading && visibleItems.length === 0 && (
                <Box sx={{ textAlign: "center", mt: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        {searchQuery.trim() !== "" || filters.likesAmount > 0 || filters.rating > 0 ? "No posts found" : "No posts yet"}
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
            />
        </Box>
    );
};

export default SearchPosts;
