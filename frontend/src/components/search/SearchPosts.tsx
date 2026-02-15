import { Box, Typography } from "@mui/material";
import BookPostCard from "@components/bookCards/post/BookPostCard";
import { useState, useEffect, useMemo } from "react";
import SearchFiltersModal from "@components/searchFilters/SearchFiltersModal";
import SearchBar from "@components/searchFilters/SearchBar";
import { useInfiniteLoader } from "@hooks/useInfiniteLoader";
import type { ISearchFiltersForm } from "@components/searchFilters/models/SearchFiltersOptions";
import { userReviewService, UserReview } from "@/api/services/userReviewService";
import type { BookPost } from "@models/Book";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

const defaultFilters: ISearchFiltersForm = {
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
    const [searchParams, setSearchParams] = useSearchParams();
    const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

    // URL State
    const urlQuery = searchParams.get("q") || "";

    // Local State for Input (initialized from URL)
    const [localSearchQuery, setLocalSearchQuery] = useState(urlQuery);

    // Sync local state if URL changes externally
    useEffect(() => {
        setLocalSearchQuery(urlQuery);
    }, [urlQuery]);

    const filters = useMemo<ISearchFiltersForm>(() => {
        return {
            language: searchParams.get("language") || "",
            genre: searchParams.get("genre") || "",
            author: searchParams.get("author") || "",
            yearPublishedFrom: searchParams.get("yearPublishedFrom") || "",
            yearPublishedTo: searchParams.get("yearPublishedTo") || "",
            rating: Number(searchParams.get("rating")) || 0,
            likesAmount: Number(searchParams.get("likesAmount")) || 0,
            reviewsAmount: Number(searchParams.get("reviewsAmount")) || 0,
            username: searchParams.get("username") || "",
        };
    }, [searchParams]);

    const { data: reviews = [], isLoading, isError, refetch } = useQuery({
        queryKey: ["allReviews", filters.likesAmount, urlQuery, filters.username],
        queryFn: () => userReviewService.getAllReviews(filters.likesAmount, urlQuery, filters.username),
    });

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
        // Add other client-side filters here if needed
        return matchesRating;
    }), [bookPosts, filters.rating]);

    const { visibleItems, loaderRef } = useInfiniteLoader<BookPost>({
        items: filteredPosts,
        batchSize: 20,
    });

    const updateSearchParams = (newParams: Record<string, string | number | undefined | null>) => {
        const nextParams = new URLSearchParams(searchParams);
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "" || value === 0) {
                nextParams.delete(key);
            } else {
                nextParams.set(key, String(value));
            }
        });
        setSearchParams(nextParams);
    };

    const handleSearch = (newSearchTerm: string) => {
        updateSearchParams({ q: newSearchTerm });
    };

    const handleApplyFilters = (newFilters: ISearchFiltersForm) => {
        updateSearchParams({
            ...newFilters,
            q: urlQuery
        });
    };

    return (
        <Box>
            <SearchBar
                onSearch={handleSearch}
                searchTerm={localSearchQuery}
                setSearchTerm={setLocalSearchQuery}
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
            />
        </Box>
    );
};

export default SearchPosts;
