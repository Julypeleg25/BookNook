import { TextField, IconButton, Button } from "@mui/material";
import { HiOutlineAdjustmentsVertical } from "react-icons/hi2";

const SearchBar = ({
  setIsFiltersModalOpen,
}: {
  setIsFiltersModalOpen: (open: boolean) => void;
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <TextField
        label="Search books by title or author"
        variant="outlined"
        style={{ width: "40%" }}
      />
      <IconButton onClick={() => setIsFiltersModalOpen(true)}>
        <HiOutlineAdjustmentsVertical size={"2rem"} />
      </IconButton>
      <Button style={{ marginLeft: "0.6rem" }}>Search</Button>
    </div>
  );
};
export default SearchBar;
