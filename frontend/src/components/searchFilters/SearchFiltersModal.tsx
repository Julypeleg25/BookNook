import { useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Rating,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import Select from "../common/Select";
import {
  genreMenuItems,
  ISearchFiltersForm,
  SearchMode,
} from "./models/SearchFiltersOptions";

interface SearchFiltersModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (data: ISearchFiltersForm) => void;
  currentFilters: ISearchFiltersForm;
  mode: SearchMode;
}

const SearchFiltersModal = ({ open, onClose, onApply, currentFilters, mode }: SearchFiltersModalProps) => {
  const { handleSubmit, control, reset, formState: { errors, isDirty } } = useForm<ISearchFiltersForm>({
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Search Filters</DialogTitle>
        <DialogContent dividers >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1, p: 4 }}>
            {mode === 'books' && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Controller
                  name="genre"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ flex: 1 }}>
                      <Select
                        label="Genre"
                        fullWidth
                        menuItems={genreMenuItems}
                        selectedValues={field.value ? [field.value] : []}
                        onChange={(val) => field.onChange(val.length > 0 ? val[0] : "")}
                      />
                    </Box>
                  )}
                />

                <Controller
                  name="author"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Author"
                      variant="outlined"
                      error={!!errors.author}
                      helperText={errors.author?.message}
                    />
                  )}
                />
              </Box>
            )}

            {mode === 'posts' && (
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            )}


            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              {mode === 'posts' && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, mt: 1 }}>Minimum Likes</Typography>
                  <Controller
                    name="likesAmount"
                    control={control}
                    render={({ field }) => (
                      <Slider
                        {...field}
                        value={field.value || 0}
                        onChange={(_, value) => field.onChange(value)}
                        min={0}
                        max={100}
                        step={0.1}
                        valueLabelDisplay="auto"
                        marks={[
                          { value: 0, label: '0' },
                          { value: 100, label: '100+' },
                        ]}
                      />
                    )}
                  />
                </Box>
              )}
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