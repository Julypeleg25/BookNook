import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import SearchFiltersModal from "@components/searchFilters/SearchFiltersModal";
import SearchBar from "@components/searchFilters/SearchBar";
import BookInfoCard from "@components/bookCards/BookInfoCard";
import { ISearchFiltersForm } from "@/components/searchFilters/models/SearchFiltersOptions";
import { axiosClient } from "@/api/axios/axiosClient";
import { endpoints } from "@/api/endpoints";
import { useQuery } from "@tanstack/react-query";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

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

      const response = await axiosClient.get(endpoints.books.search, {
        params: {
          author: filters.author || undefined,
          subject: filters.genre || undefined,
          title: searchTerm,
          reviewCount: filters.reviewsAmount || undefined,
          rating: filters.rating || undefined,
          page,
          limit: PAGE_SIZE 
        } 
      });
      return response.data;
    },
    enabled: false,
    placeholderData: (previousData) => previousData, 
  });

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  useEffect(() => {
    if (data) refetch();
  }, [page]);

  const hasMore = data?.items?.length === PAGE_SIZE;

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
            {data.items.map((book: any) => (
              <BookInfoCard key={book.id} book={book} />
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