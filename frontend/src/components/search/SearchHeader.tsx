import { Box, Chip } from "@mui/material";
import SearchBar from "@/components/searchFilters/SearchBar";
import GenreChips from "./GenreChips";

interface SearchHeaderProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  onSearch: (searchTerm: string) => void;
  onClearSearch: () => void;
  onClearFilters: () => void;
  onToggleGenre: (genre: string) => void;
  selectedGenre: string;
  setIsFiltersModalOpen: (open: boolean) => void;
  hasActiveFilters: boolean;
}

const SearchHeader = ({
  searchTerm,
  setSearchTerm,
  onSearch,
  onClearSearch,
  onClearFilters,
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
        onClearSearch={onClearSearch}
        setIsFiltersModalOpen={setIsFiltersModalOpen}
        hasActiveFilters={hasActiveFilters}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <GenreChips selectedGenre={selectedGenre} onToggleGenre={onToggleGenre} />
        {hasActiveFilters && (
          <Chip
            label="Filters active"
            onDelete={onClearFilters}
            color="primary"
            variant="outlined"
            sx={{
              ml: 2,
              fontWeight: 600,
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default SearchHeader;
