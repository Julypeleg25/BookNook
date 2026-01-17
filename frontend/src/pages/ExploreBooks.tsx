import { Box } from "@mui/material";
import { useState, useEffect } from "react";
import SearchFiltersModal from "@components/searchFilters/SearchFiltersModal";
import SearchBar from "@components/searchFilters/SearchBar";
import BookInfoCard from "@components/bookCards/BookInfoCard";
import { ISearchFiltersForm } from "@/components/searchFilters/models/SearchFiltersOptions";
import { axiosClient } from "@/api/axios/axiosClient";
import { endpoints } from "@/api/endpoints";

const ExploreBooks = () => {
  const [books, setBooks] = useState([]);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  
  // Single state for filters
  const [filters, setFilters] = useState<ISearchFiltersForm>({
    language: "",
    genre: "",
    author: "",
    yearPublishedFrom: "",
    yearPublishedTo: "",
    rating: 0,
    likesAmount: 0,
    reviewsAmount: 0
  });

  // Fetch books whenever filters change
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axiosClient.get(endpoints.books.search, {
          params: {
            author: filters.author || undefined,
            subject: filters.genre || undefined,
            language: filters.language || undefined,
            // Add other params your backend expects
          }
        });

        console.log(response.data.items)
        setBooks(response.data.items || []);
      } catch (error) {
        console.error("Failed to fetch books", error);
      }
    };

    fetchBooks();
  }, [filters]); 

  return (
    <Box sx={{ p: 3 }}>
      <SearchBar setIsFiltersModalOpen={setIsFiltersModalOpen} />
      
      <Box 
        display="grid" 
        gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" 
        gap={3} 
        mt={4}
      >
        {books.map((book: any) => (
          <BookInfoCard key={book.id} book={book} />
        ))}
      </Box>

      <SearchFiltersModal
        open={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApply={(data) => setFilters(data)} // Updates the single state
        currentFilters={filters} // Passes state back to modal
      />
    </Box>
  );
};

export default ExploreBooks;