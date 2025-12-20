import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Rating,
  TextField,
} from "@mui/material";
import SearchFiltersSelect from "./SearchFiltersSelect";

interface SearchFiltersModalProps {
  open: boolean;
  onClose: () => void;
}

const SearchFiltersModal = (props: SearchFiltersModalProps) => {
  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>Search Filters</DialogTitle>
      <DialogContent style={{ marginTop: "0.5rem" }}>
        <SearchFiltersSelect
          menuItems={[
            { value: "10", label: "Ten" },
            { value: "20", label: "Twenty" },
            { value: "30", label: "Thirty" },
          ]}
          label="Genre"
          selectedValues={[]}
          onChange={() => {}}
        />
        <div style={{ marginTop: "1rem" }}>
          Year published
          <div
            style={{
              marginTop: "0rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <TextField /> to
            <TextField />
          </div>
        </div>
        <div style={{ marginTop: "1rem" }}>
          Year published
          <div
            style={{
              justifyContent: "space-between",
              display: "flex",
              alignItems: "center",
              marginTop: "0.5rem",
            }}
          >
            <TextField />
            <Rating name="rating" style={{marginRight:'3.5rem'}} value={0} onChange={() => {}} />
          </div>
        </div>
        <SearchFiltersSelect
          menuItems={[
            {
              value: "Hebrew",
              label: "Hebrew",
            },
            { value: "English", label: "English" },
            { value: "Spanish", label: "Spanish" },
          ]}
          style={{ marginTop: "1.3rem" }}
          label="Language"
          selectedValues={[]}
          onChange={() => {}}
        />
      </DialogContent>
      <DialogActions
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
        }}
      >
        <Button onClick={props.onClose} color="error">
          Cancel
        </Button>
        <Button onClick={props.onClose}>Apply Filters</Button>
      </DialogActions>
    </Dialog>
  );
};
export default SearchFiltersModal;
