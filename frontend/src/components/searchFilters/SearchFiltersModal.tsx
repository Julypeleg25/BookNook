import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Rating,
  TextField,
  Typography,
} from "@mui/material";
import Select from "../common/Select";
import SearchFiltersToggleButtonGroup from "./SearchFiltersToggleButtonGroup";
import { Controller, useForm } from "react-hook-form";
import {
  genreMenuItems,
  languageMenuItems,
  likesMenuItems,
  reviewsMenuItems,
  yearFieldRules,
  type ISearchFiltersForm,
} from "./models/SearchFiltersOptions";

interface SearchFiltersModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (data: ISearchFiltersForm) => void;
}
// models/SearchFiltersOptions.ts


export interface BooksQuery {
  title?: string;
  author?: string;
  subject?: string; // This maps to "genre"
  language?: string;
  page?: string;
  limit?: string;
}

export interface BookSummary {
  id: string;
  title: string;
  authors: string[];
  thumbnail: string;
}


interface SearchFiltersModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (data: ISearchFiltersForm) => void;
}

const SearchFiltersModal = ({ open, onClose, onApply }: SearchFiltersModalProps) => {
  const { handleSubmit, control, getValues, reset, formState: { errors, isDirty } } = useForm<ISearchFiltersForm>({
    defaultValues: { language: "", genre: "", author: "", yearPublishedFrom: "", yearPublishedTo: "", rating: 0 },
  });

  const onSubmit = (data: ISearchFiltersForm) => {
    onApply(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Search Filters</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <Select
                  label="Language"
                  menuItems={languageMenuItems}
                  selectedValues={field.value ? [field.value] : []}
                  onChange={(val) => field.onChange(val[0])}
                />
              )}
            />
            <Controller
              name="genre"
              control={control}
              render={({ field }) => (
                <Select
                  label="Genre"
                  menuItems={genreMenuItems}
                  selectedValues={field.value ? [field.value] : []}
                  onChange={(val) => field.onChange(val[0])}
                />
              )}
            />
          </Box>

          <Controller
            name="author"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="Author" error={!!errors.author} helperText={errors.author?.message} sx={{ mt: 3 }} />
            )}
          />

          {/* Rating Section */}
          <Box sx={{ mt: 3 }}>
            <Typography>Rating - at least</Typography>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => <Rating {...field} onChange={(_, val) => field.onChange(val)} />}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="error">Cancel</Button>
          <Button type="submit" variant="contained" disabled={!isDirty}>Apply Filters</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
export default SearchFiltersModal;
