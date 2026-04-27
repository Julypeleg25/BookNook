import { TextField, IconButton, Button, Box, InputAdornment, Badge, Tooltip } from "@mui/material";
import { HiOutlineAdjustmentsVertical } from "react-icons/hi2";
import { MdClear } from "react-icons/md";
import { useState, useEffect } from "react";
import { SEARCH_QUERY_MAX_LENGTH } from "@shared/constants/validation";

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  onClearSearch: () => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  setIsFiltersModalOpen: (open: boolean) => void;
  hasActiveFilters?: boolean;
}

const SearchBar = ({ onSearch, onClearSearch, searchTerm, setSearchTerm, setIsFiltersModalOpen, hasActiveFilters }: SearchBarProps) => {
  const [placeholder, setPlaceholder] = useState("");
  const fullPlaceholder = "Search books or review text...";
  
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
              <IconButton onClick={onClearSearch} size="small" sx={{ mr: -1 }}>
                <MdClear />
              </IconButton>
            </InputAdornment>
          ) : null
        }}
      />
      <Tooltip title={hasActiveFilters ? "Filters applied" : "Open filters"}>
        <IconButton
          onClick={() => setIsFiltersModalOpen(true)}
          color={hasActiveFilters ? "primary" : "default"}
          sx={{
            border: "1px solid",
            borderColor: hasActiveFilters ? "primary.main" : "divider",
            bgcolor: hasActiveFilters ? "action.selected" : "transparent",
          }}
        >
          <Badge color="primary" variant="dot" invisible={!hasActiveFilters}>
            <HiOutlineAdjustmentsVertical size={"2rem"} />
          </Badge>
        </IconButton>
      </Tooltip>
      <Button variant="contained" onClick={handleSearch}>
        Search
      </Button>
    </Box>
  );
};
export default SearchBar;
