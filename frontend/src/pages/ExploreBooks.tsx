import { Box, Fab } from "@mui/material";
import { books } from "../exampleData";
import SearchFiltersModal, { BookSummary } from "@components/searchFilters/SearchFiltersModal";
import SearchBar from "@components/searchFilters/SearchBar";
import BookInfoCard from "@components/bookCards/BookInfoCard";
import { MdAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useInfiniteLoader } from "@hooks/useInfiniteLoader";
import { useState } from "react";
import { ISearchFiltersForm } from "@/components/searchFilters/models/SearchFiltersOptions";
import { axiosClient } from "@/api/axios/axiosClient";
import { endpoints } from "@/api/endpoints";

// ExploreBooks.tsx

const ExploreBooks = () => {
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [filters, setFilters] = useState<ISearchFiltersForm | null>(null);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false)

  const handleSearch = async (formFilters: ISearchFiltersForm) => {
    setFilters(formFilters);
    
    // Call your API helper (make sure this hits your backend route)
    const response = await axiosClient.get(endpoints.books.search, {
      params: {
        author: formFilters.author,
        genre: formFilters.genre,
        language: formFilters.language,
        // Map other fields as needed
      }
    });
    
    setBooks(response.items);
  };

  return (
    <Box>
      <SearchBar setIsFiltersModalOpen={setIsFiltersModalOpen} />
      
      {/* Grid displaying the 'books' state */}
      <Box display="grid">
        {books.map((book) => <BookInfoCard key={book.id} book={book} />)}
      </Box>

      <SearchFiltersModal
        open={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApply={handleSearch} // Pass the submit handler here
      />
    </Box>
  );
};

export default ExploreBooks;
