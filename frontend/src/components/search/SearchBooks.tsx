import { Box, CircularProgress, Typography } from "@mui/material";
import BookCardSkeleton from "../bookCards/BookCardSkeleton";
import { useRef, useCallback, useEffect, useState } from "react";
import SearchHeader from "./SearchHeader";
import SearchFiltersModal from "@components/searchFilters/SearchFiltersModal";
import BookInfoCard from "@components/bookCards/BookInfoCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import { booksService } from "@/api/services/bookService";
import type { Book } from "@/models/Book";
import { useSearchParamsState } from "@/hooks/useSearchParamsState";

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
        handleClear,
        setGenre
    } = useSearchParamsState();

    const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);

    const hasActiveFilters =
        filters.author.trim().length > 0 ||
        filters.genre.trim().length > 0 ||
        filters.rating > 0 ||
        filters.reviewsAmount > 0;

    const hasValidQuery = urlQuery.trim().length > 0 || hasActiveFilters;

    const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ["booksSearch", urlQuery, filters],
        queryFn: async ({ pageParam = 1 }) => {
            return await booksService.search({
                author: filters.author || undefined,
                subject: filters.genre || undefined,
                title: urlQuery,
                reviewCount: filters.reviewsAmount || undefined,
                rating: filters.rating || undefined,
                page: pageParam as number,
                limit: PAGE_SIZE
            });
        },
        getNextPageParam: (lastPage: any) => {
            return lastPage.hasNextPage ? (lastPage.page as number) + 1 : undefined;
        },
        initialPageParam: 1,
        enabled: hasValidQuery,
    });

    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const [target] = entries;
        if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    useEffect(() => {
        const element = observerTarget.current;
        if (!element) return;

        const observer = new IntersectionObserver(handleObserver, {
            threshold: 0.1,
        });

        observer.observe(element);
        return () => observer.disconnect();
    }, [handleObserver]);

    const allBooks = data?.pages.flatMap((page: any) => page.items) ?? [];
    const showEmptyState = hasValidQuery && !isLoading && allBooks.length === 0;

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

            {isLoading && !isFetchingNextPage && (
                <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={3} mt={4}>
                    {[...Array(8)].map((_, i) => (
                        <BookCardSkeleton key={i} />
                    ))}
                </Box>
            )}

            {!isLoading && allBooks.length > 0 && (
                <Box>
                    <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={3} mt={4}>
                        {allBooks.map((bookSummary: any) => (
                            <BookInfoCard
                                key={bookSummary.id}
                                book={bookSummary as Book}
                                isOnlyInfo={true}
                                onSelect={isSelectMode ? () => onBookSelect?.(bookSummary as Book) : undefined}
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
