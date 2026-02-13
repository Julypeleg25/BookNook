import { Box, CircularProgress, Typography, Skeleton } from "@mui/material";
import { useRef, useCallback, useEffect } from "react";
import SearchBar from "@components/searchFilters/SearchBar";
import SearchFiltersModal from "@components/searchFilters/SearchFiltersModal";
import BookInfoCard from "@components/bookCards/BookInfoCard";
import { ISearchFiltersForm } from "@/components/searchFilters/models/SearchFiltersOptions";
import { useInfiniteQuery } from "@tanstack/react-query";
import { booksService } from "@/api/services/bookService";
import type { Book } from "@/models/Book";
import { useState } from "react";

const PAGE_SIZE = 20;

interface SearchBooksProps {
    isSelectMode?: boolean;
    onBookSelect?: (book: Book) => void;
}

const SearchBooks = ({ isSelectMode = false, onBookSelect }: SearchBooksProps) => {
    const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<ISearchFiltersForm>({
        language: "", genre: "", author: "", yearPublishedFrom: "",
        yearPublishedTo: "", rating: 0, likesAmount: 0, reviewsAmount: 0
    });

    const observerTarget = useRef<HTMLDivElement>(null);

    // Build search params from filters
    const hasValidQuery = searchQuery.trim().length > 0 ||
        filters.author.trim().length > 0 ||
        filters.genre.trim().length > 0 ||
        filters.rating > 0 ||
        filters.reviewsAmount > 0;

    const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ["booksSearch", searchQuery, filters],
        queryFn: async ({ pageParam = 1 }) => {
            return await booksService.search({
                author: filters.author || undefined,
                subject: filters.genre || undefined,
                title: searchQuery,
                reviewCount: filters.reviewsAmount || undefined,
                rating: filters.rating || undefined,
                page: pageParam,
                limit: PAGE_SIZE
            });
        },
        getNextPageParam: (lastPage) => {
            return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
        },
        initialPageParam: 1,
        enabled: hasValidQuery,
    });

    const handleSearch = (newSearchTerm: string) => {
        setSearchQuery(newSearchTerm);
    };

    const handleFiltersApply = (newFilters: ISearchFiltersForm) => {
        setFilters(newFilters);
    };

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

    const allBooks = data?.pages.flatMap(page => page.items) ?? [];
    const hasSearched = hasValidQuery;
    const showEmptyState = hasSearched && !isLoading && allBooks.length === 0;

    return (
        <Box>
            <SearchBar
                searchTerm={searchQuery}
                setSearchTerm={setSearchQuery}
                onSearch={handleSearch}
                setIsFiltersModalOpen={setIsFiltersModalOpen}
            />

            {/* Initial Loading */}
            {isLoading && !isFetchingNextPage && (
                <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={3} mt={4}>
                    {[...Array(8)].map((_, i) => (
                        <Box key={i}>
                            <Skeleton variant="rectangular" width="100%" height={288} sx={{ borderRadius: 2 }} />
                            <Skeleton width="80%" sx={{ mt: 1 }} />
                            <Skeleton width="60%" />
                        </Box>
                    ))}
                </Box>
            )}

            {/* Results */}
            {!isLoading && allBooks.length > 0 && (
                <Box>
                    <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={3} mt={4}>
                        {allBooks.map((bookSummary) => (
                            <BookInfoCard
                                key={bookSummary.id}
                                book={bookSummary as Book}
                                isOnlyInfo={true}
                                onSelect={isSelectMode ? () => onBookSelect?.(bookSummary as Book) : undefined}
                            />
                        ))}
                    </Box>

                    {/* Sentinel for infinite scroll */}
                    <div ref={observerTarget} style={{ height: '20px', margin: '20px 0' }} />

                    {/* Loading More */}
                    {isFetchingNextPage && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                            <CircularProgress size={24} />
                            <Typography sx={{ ml: 2 }}>Loading more...</Typography>
                        </Box>
                    )}
                </Box>
            )}

            {/* Empty State */}
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

            {/* Error State */}
            {isError && (
                <Typography color="error" sx={{ mt: 4, textAlign: 'center' }}>
                    Error in search, please try again.
                </Typography>
            )}

            <SearchFiltersModal
                open={isFiltersModalOpen}
                onClose={() => setIsFiltersModalOpen(false)}
                onApply={handleFiltersApply}
                currentFilters={filters}
            />
        </Box>
    );
};

export default SearchBooks;
