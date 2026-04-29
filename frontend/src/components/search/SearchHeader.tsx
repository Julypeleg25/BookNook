import { Box, Paper } from "@mui/material";
import SearchBar from "@/components/searchFilters/SearchBar";
import GenreChips from "./GenreChips";
import type {
  FilterModalOpenHandler,
  GenreToggleHandler,
  SearchMode,
  SearchSubmitHandler,
  SearchTermChangeHandler,
} from "@/components/searchFilters/models/SearchFiltersOptions";

interface SearchHeaderProps {
  searchTerm: string;
  setSearchTerm: SearchTermChangeHandler;
  onSearch: SearchSubmitHandler;
  onClearSearch: () => void;
  onClearFilters: () => void;
  onToggleGenre: GenreToggleHandler;
  selectedGenre: string;
  setIsFiltersModalOpen: FilterModalOpenHandler;
  hasActiveFilters: boolean;
  mode?: SearchMode;
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
  mode = "posts",
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
        mode={mode}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <GenreChips selectedGenre={selectedGenre} onToggleGenre={onToggleGenre} />
      </Box>
    </Paper>
  );
};

export default SearchHeader;
