import { TextField, IconButton, Button, Box } from "@mui/material";
import { HiOutlineAdjustmentsVertical } from "react-icons/hi2";

interface SearchBarProps {
  onSearch: () => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  setIsFiltersModalOpen: (open: boolean) => void;
}

const SearchBar = ({ onSearch, searchTerm, setSearchTerm, setIsFiltersModalOpen }: SearchBarProps) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <TextField
        placeholder="Search books by title"
        variant="outlined"
        fullWidth
        sx={{ maxWidth: "45rem" }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <IconButton onClick={() => setIsFiltersModalOpen(true)}>
        <HiOutlineAdjustmentsVertical size={"2rem"} />
      </IconButton>
      <Button variant="contained" onClick={onSearch}>
        Search
      </Button>
    </Box>
  );
};
export default SearchBar;
