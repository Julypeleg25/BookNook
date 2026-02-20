import { Box } from "@mui/material";
import SearchBar from "@/components/searchFilters/SearchBar";
import GenreChips from "./GenreChips";

interface SearchHeaderProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  onSearch: (searchTerm: string) => void;
  onClear: () => void;
  onToggleGenre: (genre: string) => void;
  selectedGenre: string;
  setIsFiltersModalOpen: (open: boolean) => void;
  hasActiveFilters: boolean;
}

const SearchHeader = ({
  searchTerm,
  setSearchTerm,
  onSearch,
  onClear,
  onToggleGenre,
  selectedGenre,
  setIsFiltersModalOpen,
  hasActiveFilters,
}: SearchHeaderProps) => {
  return (
    <Box>
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={onSearch}
        onClear={onClear}
        setIsFiltersModalOpen={setIsFiltersModalOpen}
        hasActiveFilters={hasActiveFilters}
      />
      <GenreChips selectedGenre={selectedGenre} onToggleGenre={onToggleGenre} />
    </Box>
  );
};

export default SearchHeader;
