import { TextField, IconButton, Button } from "@mui/material";
import { HiOutlineAdjustmentsVertical } from "react-icons/hi2";

const SearchBar = ({
  setIsFiltersModalOpen,
}: {
  setIsFiltersModalOpen: (open: boolean) => void;
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "80rem",
        maxWidth: "90rem",
      }}
    >
      <TextField
        label="Search"
        placeholder="Search books by title or author"
        variant="outlined"
        style={{ width: "60rem", maxWidth: "45rem" }}
      />
      <IconButton onClick={() => setIsFiltersModalOpen(true)}>
        <HiOutlineAdjustmentsVertical size={"2rem"} />
      </IconButton>
      <Button style={{ marginLeft: "0.6rem" }} variant="outlined">
        Search
      </Button>
    </div>
  );
};
export default SearchBar;
