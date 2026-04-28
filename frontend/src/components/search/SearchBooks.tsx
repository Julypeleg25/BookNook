import { Box, CircularProgress, Typography } from "@mui/material";
import BookCardSkeleton from "../bookCards/BookCardSkeleton";
import { useRef, useState } from "react";
import SearchHeader from "./SearchHeader";
import SearchFiltersModal from "@components/searchFilters/SearchFiltersModal";
import BookInfoCard from "@components/bookCards/BookInfoCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import { booksService } from "@/api/services/bookService";
import type { Book } from "@/models/Book";
import { useSearchParamsState } from "@/hooks/useSearchParamsState";
import { queryKeys } from "@/api/queryKeys";
import { useIntersectionObserver } from "@hooks/useIntersectionObserver";

const PAGE_SIZE = 20;

interface SearchBooksProps {
    isSelectMode?: boolean;
    onBookSelect?: (book: Book) => void;
}

const SearchBooks = ({ isSelectMode = false, onBookSelect }: SearchBooksProps) => {
    const {
        filters,
        urlQuery,
        localSearchQuery,
        setLocalSearchQuery,
        handleSearch,
        handleApplyFilters,
        handleClearSearch,
        handleClearFilters,
        setGenre
    } = useSearchParamsState();

    const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);
    const queryResetKey = JSON.stringify([urlQuery, filters]);

    const hasActiveFilters =
        filters.author.trim().length > 0 ||
        filters.genre.trim().length > 0 ||
        filters.rating > 0 ||
        filters.minReviews > 0

    const hasValidQuery = urlQuery.trim().length > 0 || hasActiveFilters;

    const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: queryKeys.booksSearch(urlQuery, filters),
        queryFn: async ({ pageParam = 1 }) => {
            return await booksService.search({
                author: filters.author || undefined,
                subject: filters.genre || undefined,
                title: urlQuery,
                rating: filters.rating || undefined,
                reviewCount: filters.minReviews || undefined,
                page: pageParam as number,
                limit: PAGE_SIZE
            });
        },
        getNextPageParam: (lastPage) => {
            return lastPage.hasNextPage ? (lastPage.page) + 1 : undefined;
        },
        initialPageParam: 1,
        enabled: hasValidQuery,
    });

    useIntersectionObserver({
        targetRef: observerTarget,
        onIntersect: fetchNextPage,
        enabled: !!hasNextPage && !isFetchingNextPage,
        resetKey: queryResetKey,
    });

    const allBooks = data?.pages.flatMap((page) => page.items) ?? [];
    const showEmptyState = hasValidQuery && !isLoading && allBooks.length === 0;

    return (
        <Box>
            <SearchHeader
                searchTerm={localSearchQuery}
                setSearchTerm={setLocalSearchQuery}
                onSearch={handleSearch}
                onClearSearch={handleClearSearch}
                onClearFilters={handleClearFilters}
                onToggleGenre={setGenre}
                selectedGenre={filters.genre}
                setIsFiltersModalOpen={setIsFiltersModalOpen}
                hasActiveFilters={hasActiveFilters}
            />

            {isLoading && !isFetchingNextPage && (
                <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={2.5} mt={3} justifyItems="center">
                    {[...Array(8)].map((_, i) => (
                        <BookCardSkeleton key={i} />
                    ))}
                </Box>
            )}

            {!isLoading && allBooks.length > 0 && (
                <Box>
                    <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={2.5} mt={3} justifyItems="center">
                        {allBooks.map((bookSummary) => (
                            <BookInfoCard
                                key={bookSummary.id}
                                book={bookSummary}
                                isOnlyInfo={true}
                                onSelect={isSelectMode ? () => onBookSelect?.(bookSummary as Book) : undefined}
                                hideMenu={true}
                            />
                        ))}
                    </Box>

                    <div ref={observerTarget} style={{ height: '20px', margin: '20px 0' }} />

                    {isFetchingNextPage && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                            <CircularProgress size={24} />
                            <Typography sx={{ ml: 2 }}>Loading more...</Typography>
                        </Box>
                    )}
                </Box>
            )}

            {!hasValidQuery && (
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        Search for a book
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Start typing to search for books, or apply some filters.
                    </Typography>
                </Box>
            )}

            {showEmptyState && (
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        No books found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Try adjusting your search or filters
                    </Typography>
                </Box>
            )}

            {isError && (
                <Typography color="error" sx={{ mt: 4, textAlign: 'center' }}>
                    Error in search, please try again.
                </Typography>
            )}

            <SearchFiltersModal
                open={isFiltersModalOpen}
                onClose={() => setIsFiltersModalOpen(false)}
                onApply={handleApplyFilters}
                currentFilters={filters}
                mode="books"
            />
        </Box>
    );
};

export default SearchBooks;
