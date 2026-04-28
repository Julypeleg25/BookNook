import { Box, Paper } from "@mui/material";
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
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        bgcolor: "background.paper",
      }}
    >
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={onSearch}
        onClearSearch={onClearSearch}
        onClearFilters={onClearFilters}
        setIsFiltersModalOpen={setIsFiltersModalOpen}
        hasActiveFilters={hasActiveFilters}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <GenreChips selectedGenre={selectedGenre} onToggleGenre={onToggleGenre} />
      </Box>
    </Paper>
  );
};

export default SearchHeader;
