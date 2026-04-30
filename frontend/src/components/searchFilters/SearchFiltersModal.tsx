import { useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import { useForm } from "react-hook-form";
import {
  ISearchFiltersForm,
  SearchMode,
} from "./models/SearchFiltersOptions";
import { HiOutlineAdjustmentsVertical } from "react-icons/hi2";
import SearchFilterFields from "./SearchFilterFields";

interface SearchFiltersModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (data: ISearchFiltersForm) => void;
  currentFilters: ISearchFiltersForm;
  mode: SearchMode;
}

const SearchFiltersModal = ({ open, onClose, onApply, currentFilters, mode }: SearchFiltersModalProps) => {
  const { handleSubmit, control, reset, formState: { isDirty } } = useForm<ISearchFiltersForm>({
    defaultValues: {
      ...currentFilters,
      username: currentFilters.username || "",
    },
  });

  useEffect(() => {
    if (open) reset(currentFilters);
  }, [open, currentFilters, reset]);

  const onSubmit = (data: ISearchFiltersForm) => {
    onApply(data);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableScrollLock
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "1rem",
          overflow: "hidden",
        },
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            fontWeight: 700,
            fontSize: "1.25rem",
            pb: 1,
          }}
        >
          <HiOutlineAdjustmentsVertical size={22} />
          {mode === "books" ? "Book Filters" : "Post Filters"}
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <SearchFilterFields control={control} mode={mode} />
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={onClose}
            color="inherit"
            sx={{
              borderRadius: "0.5rem",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isDirty}
            sx={{
              borderRadius: "0.5rem",
              textTransform: "none",
              fontWeight: 600,
              px: 4,
            }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SearchFiltersModal;
