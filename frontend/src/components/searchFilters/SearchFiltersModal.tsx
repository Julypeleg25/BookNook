import { useEffect } from "react";
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
import { Controller, useForm } from "react-hook-form";
import Select from "../common/Select";
import {
  genreMenuItems,
  languageMenuItems,
  ISearchFiltersForm,
} from "./models/SearchFiltersOptions";

interface SearchFiltersModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (data: ISearchFiltersForm) => void;
  currentFilters: ISearchFiltersForm;
}

const SearchFiltersModal = ({ open, onClose, onApply, currentFilters }: SearchFiltersModalProps) => {
  const { handleSubmit, control, reset, formState: { errors, isDirty } } = useForm<ISearchFiltersForm>({
    defaultValues: currentFilters,
  });

  // Syncs the modal with the state when opened
  useEffect(() => {
    if (open) reset(currentFilters);
  }, [open, currentFilters, reset]);

    useEffect(() => {
    console.log(currentFilters)
  }, [open, currentFilters, reset]);

  const onSubmit = (data: ISearchFiltersForm) => {
    onApply(data);
    onClose();
  };

  return (
    // maxWidth="sm" and fullWidth here make the modal itself a good size
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Search Filters</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            
            {/* Language & Genre: use flexbox to make them sit side-by-side but grow */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
              
                name="language"
                control={control}
                render={({ field }) => (
                  <Box sx={{ flex: 1 }}> {/* Box helps control the width */}
                    <Select
                      label="Language"
                      menuItems={languageMenuItems}
                      // Pass an array to the component, but ensure it's never undefined
                      selectedValues={field.value ? [field.value] : []} 
                      // Crucial: check if val exists before accessing index 0
                      onChange={(val) => field.onChange(val.length > 0 ? val[0] : "")}
                    />
                  </Box>
                )}
              />
              <Controller
                name="genre"
                control={control}
                render={({ field }) => (
                  <Box sx={{ flex: 1 }}>
                    <Select
                      label="Genre"
                      menuItems={genreMenuItems}
                      selectedValues={field.value ? [field.value] : []}
                      onChange={(val) => field.onChange(val.length > 0 ? val[0] : "")}
                    />
                  </Box>
                )}
              />
            </Box>

            {/* Author */}
            <Controller
              name="author"
              control={control}
              render={({ field }) => (
                <TextField 
                  {...field} 
                  fullWidth 
                  label="Author" 
                  variant="outlined"
                  error={!!errors.author} 
                  helperText={errors.author?.message} 
                />
              )}
            />

            {/* Rating */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Minimum Rating</Typography>
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <Rating 
                    {...field} 
                    precision={0.5}
                    value={Number(field.value)} 
                    onChange={(_, val) => field.onChange(val)} 
                  />
                )}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={!isDirty}
            sx={{ px: 4 }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SearchFiltersModal;