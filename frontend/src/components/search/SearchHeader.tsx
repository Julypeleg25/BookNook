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
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <GenreChips selectedGenre={selectedGenre} onToggleGenre={onToggleGenre} />
        {hasActiveFilters && (
          <Box
            component="span"
            onClick={onClear}
            sx={{
              ml: 2,
              cursor: 'pointer',
              color: 'primary.main',
              fontSize: '0.85rem',
              fontWeight: 500,
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Clear all filters
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SearchHeader;
