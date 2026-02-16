import { Box, CircularProgress, Typography, Skeleton } from "@mui/material";
import { useRef, useCallback, useEffect, useMemo, useState } from "react";
import SearchBar from "@components/searchFilters/SearchBar";
import SearchFiltersModal from "@components/searchFilters/SearchFiltersModal";
import BookInfoCard from "@components/bookCards/BookInfoCard";
import { ISearchFiltersForm } from "@/components/searchFilters/models/SearchFiltersOptions";
import { useInfiniteQuery } from "@tanstack/react-query";
import { booksService } from "@/api/services/bookService";
import type { Book } from "@/models/Book";
import { useSearchParams } from "react-router-dom";

const PAGE_SIZE = 20;

interface SearchBooksProps {
    isSelectMode?: boolean;
    onBookSelect?: (book: Book) => void;
}

const SearchBooks = ({ isSelectMode = false, onBookSelect }: SearchBooksProps) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

    // URL State
    const urlQuery = searchParams.get("q") || "";

    // Local State for Input (initialized from URL)
    const [localSearchQuery, setLocalSearchQuery] = useState(urlQuery);

    // Sync local state if URL changes externally (e.g. back button)
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
            username: "",
        };
    }, [searchParams]);

    const observerTarget = useRef<HTMLDivElement>(null);

    const hasValidQuery = urlQuery.trim().length > 0 ||
        filters.author.trim().length > 0 ||
        filters.genre.trim().length > 0 ||
        filters.rating > 0 ||
        filters.reviewsAmount > 0;

    const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ["booksSearch", urlQuery, filters],
        queryFn: async ({ pageParam = 1 }) => {
            return await booksService.search({
                author: filters.author || undefined,
                subject: filters.genre || undefined,
                title: urlQuery,
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

    const handleFiltersApply = (newFilters: ISearchFiltersForm) => {
        updateSearchParams({
            ...newFilters,
            q: urlQuery
        });
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
                searchTerm={localSearchQuery}
                setSearchTerm={setLocalSearchQuery}
                onSearch={handleSearch}
                setIsFiltersModalOpen={setIsFiltersModalOpen}
            />

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
                onApply={handleFiltersApply}
                currentFilters={filters}
                mode="books"
            />
        </Box>
    );
};

export default SearchBooks;
