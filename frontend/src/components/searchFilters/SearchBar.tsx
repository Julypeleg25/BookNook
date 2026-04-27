import { TextField, IconButton, Button, Box, InputAdornment } from "@mui/material";
import { HiOutlineAdjustmentsVertical } from "react-icons/hi2";
import { MdClear } from "react-icons/md";
import { useState, useEffect } from "react";
import { SEARCH_QUERY_MAX_LENGTH } from "@shared/constants/validation";

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  onClear: () => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  setIsFiltersModalOpen: (open: boolean) => void;
  hasActiveFilters?: boolean;
}

const SearchBar = ({ onSearch, onClear, searchTerm, setSearchTerm, setIsFiltersModalOpen, hasActiveFilters }: SearchBarProps) => {
  const [placeholder, setPlaceholder] = useState("");
  const fullPlaceholder = "Search by book title...";
  
  useEffect(() => {
    let i = 0;
    setPlaceholder("");
    const interval = setInterval(() => {
      setPlaceholder(fullPlaceholder.slice(0, i));
      i++;
      if (i > fullPlaceholder.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <TextField
        placeholder={placeholder}
        variant="outlined"
        fullWidth
        sx={{ maxWidth: "45rem" }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
        slotProps={{
          htmlInput: {
            maxLength: SEARCH_QUERY_MAX_LENGTH,
          },
        }}
        InputProps={{
          endAdornment: searchTerm ? (
            <InputAdornment position="end">
              <IconButton onClick={onClear} size="small" sx={{ mr: -1 }}>
                <MdClear />
              </IconButton>
            </InputAdornment>
          ) : null
        }}
      />
      <IconButton 
        onClick={() => setIsFiltersModalOpen(true)}
        color={hasActiveFilters ? "primary" : "default"}
      >
        <HiOutlineAdjustmentsVertical size={"2rem"} />
      </IconButton>
      <Button
        variant="text"
        onClick={onClear}
        sx={{
          textTransform: "none",
          color: "text.secondary",
          whiteSpace: "nowrap"
        }}
      >
        Clear All
      </Button>
      <Button variant="contained" onClick={handleSearch}>
        Search
      </Button>
    </Box>
  );
};
export default SearchBar;
