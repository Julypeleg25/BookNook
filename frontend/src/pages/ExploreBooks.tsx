import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import SearchFiltersModal from "@components/searchFilters/SearchFiltersModal";
import SearchBar from "@components/searchFilters/SearchBar";
import BookInfoCard from "@components/bookCards/BookInfoCard";
import { ISearchFiltersForm } from "@/components/searchFilters/models/SearchFiltersOptions";
import { useQuery } from "@tanstack/react-query";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { booksService } from "@/api/services/bookService";
import type { Book } from "@/models/Book";

const PAGE_SIZE = 20;

const ExploreBooks = () => {
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState<ISearchFiltersForm>({
    language: "", genre: "", author: "", yearPublishedFrom: "", 
    yearPublishedTo: "", rating: 0, likesAmount: 0, reviewsAmount: 0
  });

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["booksSearch", filters, searchTerm, page],
    queryFn: async () => {
      return await booksService.search({
          author: filters.author || undefined,
          subject: filters.genre || undefined,
          title: searchTerm,
          reviewCount: filters.reviewsAmount || undefined,
          rating: filters.rating || undefined,
          page,
          limit: PAGE_SIZE 
      });
    },
    enabled: false,
    placeholderData: (previousData) => previousData, 
  });

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  useEffect(() => {
    // Only refetch if we have performed a search at least once (data exists) or we want initial load?
    // Originally: if (data) refetch(); -> implies only refetch on page change if data loaded.
    // Ideally, we might want initial load. The useQuery has enabled: false.
    // Let's keep logic similar but safer.
    if (data || searchTerm || Object.values(filters).some(Boolean)) {
       refetch();
    }
  }, [page]); 

  const hasMore = (data?.items?.length || 0) === PAGE_SIZE;

  return (
    <Box sx={{ p: 3 }}>
      <SearchBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch} 
        setIsFiltersModalOpen={setIsFiltersModalOpen} 
      />
      
      {(isLoading || isFetching) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
      )}

      {!isLoading && !isFetching && data?.items && (
        <>
          <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={3} mt={4}>
            {data.items.map((bookSummary) => (
              // BookSummary is compatible with Book interface (with optional fields)
              <BookInfoCard key={bookSummary.id} book={bookSummary as Book} isOnlyInfo={true} />
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 6, gap: 3 }}>
            <Button
              variant="outlined"
              startIcon={<HiChevronLeft />}
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>

            <Typography sx={{ fontWeight: 'bold' }}>Page {page}</Typography>

            {/* We don't know total count from API strictly (Google returns estimates), 
                but we can guess if full page returned */}
            <Button
              variant="outlined"
              endIcon={<HiChevronRight />}
              onClick={() => setPage((old) => old + 1)}
              disabled={!hasMore} 
            >
              Next
            </Button>
          </Box>
        </>
      )}

      {isError && <Typography color="error" sx={{ mt: 4 }}>Error in search, please try again.</Typography>}
      
      {data?.items?.length === 0 && !isFetching && (
        <Typography sx={{ mt: 4 }}>No books found.</Typography>
      )}

      <SearchFiltersModal
        open={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApply={(newData) => {
          setFilters(newData);
          setPage(1);
        }}
        currentFilters={filters}
      />
    </Box>
  );
};

export default ExploreBooks;