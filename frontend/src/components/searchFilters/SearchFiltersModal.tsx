import { useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Rating,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import {
  ISearchFiltersForm,
  SearchMode,
} from "./models/SearchFiltersOptions";
import { RATING_STEP } from "@shared/constants/validation";
import { HiOutlineAdjustmentsVertical } from "react-icons/hi2";

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

            {mode === "books" && (
              <>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}
                  >
                    Author
                  </Typography>
                  <Controller
                    name="author"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        placeholder="e.g. J.K. Rowling"
                        variant="outlined"
                        fullWidth
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "0.5rem",
                          },
                        }}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}
                  >
                    Minimum Rating
                  </Typography>
                  <Controller
                    name="rating"
                    control={control}
                    render={({ field }) => (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Rating
                          {...field}
                          precision={RATING_STEP}
                          value={Number(field.value) || 0}
                          onChange={(_, val) => field.onChange(Number(val ?? 0))}
                          size="large"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {field.value > 0 ? `${field.value}+` : "Any"}
                        </Typography>
                      </Box>
                    )}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}
                  >
                    Min Number of Reviews
                  </Typography>
                  <Controller
                    name="minReviews"
                    control={control}
                    render={({ field }) => (
                      <Box sx={{ px: 1 }}>
                        <Slider
                          {...field}
                          value={field.value || 0}
                          onChange={(_, value) => field.onChange(value)}
                          min={0}
                          max={100}
                          step={5}
                          valueLabelDisplay="auto"
                          marks={[
                            { value: 0, label: "0" },
                            { value: 25, label: "25" },
                            { value: 50, label: "50" },
                            { value: 75, label: "75" },
                            { value: 100, label: "100+" },
                          ]}
                        />
                      </Box>
                    )}
                  />
                </Box>
              </>
            )}

            {mode === "posts" && (
              <>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}
                  >
                    Username
                  </Typography>
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        placeholder="Filter by username"
                        variant="outlined"
                        fullWidth
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "0.5rem",
                          },
                        }}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}
                  >
                    Minimum Rating
                  </Typography>
                  <Controller
                    name="rating"
                    control={control}
                    render={({ field }) => (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Rating
                          {...field}
                          precision={RATING_STEP}
                          value={Number(field.value) || 0}
                          onChange={(_, val) => field.onChange(Number(val ?? 0))}
                          size="large"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {field.value > 0 ? `${field.value}+` : "Any"}
                        </Typography>
                      </Box>
                    )}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}
                  >
                    Minimum Likes
                  </Typography>
                  <Controller
                    name="likesAmount"
                    control={control}
                    render={({ field }) => (
                      <Box sx={{ px: 1 }}>
                        <Slider
                          {...field}
                          value={field.value || 0}
                          onChange={(_, value) => field.onChange(value)}
                          min={0}
                          max={50}
                          step={1}
                          valueLabelDisplay="auto"
                          marks={[
                            { value: 0, label: "0" },
                            { value: 10, label: "10" },
                            { value: 25, label: "25" },
                            { value: 50, label: "50+" },
                          ]}
                        />
                      </Box>
                    )}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}
                  >
                    Minimum Comments
                  </Typography>
                  <Controller
                    name="minComments"
                    control={control}
                    render={({ field }) => (
                      <Box sx={{ px: 1 }}>
                        <Slider
                          {...field}
                          value={field.value || 0}
                          onChange={(_, value) => field.onChange(value)}
                          min={0}
                          max={50}
                          step={1}
                          valueLabelDisplay="auto"
                          marks={[
                            { value: 0, label: "0" },
                            { value: 10, label: "10" },
                            { value: 25, label: "25" },
                            { value: 50, label: "50+" },
                          ]}
                        />
                      </Box>
                    )}
                  />
                </Box>
              </>
            )}
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
