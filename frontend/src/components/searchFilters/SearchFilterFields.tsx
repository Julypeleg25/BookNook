import { Box, Rating, Slider, TextField, Typography } from "@mui/material";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { RATING_STEP } from "@shared/constants/validation";
import type { ISearchFiltersForm, SearchMode } from "./models/SearchFiltersOptions";
import FilterField from "./FilterField";

interface SearchFilterFieldsProps {
  control: Control<ISearchFiltersForm>;
  mode: SearchMode;
}

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "0.5rem",
  },
};

const postLikeMarks = [
  { value: 0, label: "0" },
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50+" },
];

const reviewMarks = [
  { value: 0, label: "0" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 75, label: "75" },
  { value: 100, label: "100+" },
];

const RatingFilter = ({ control }: Pick<SearchFilterFieldsProps, "control">) => (
  <FilterField label="Minimum Rating">
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
  </FilterField>
);

const SearchFilterFields = ({ control, mode }: SearchFilterFieldsProps) => (
  <>
    {mode === "books" && (
      <>
        <FilterField label="Author">
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
                sx={textFieldSx}
              />
            )}
          />
        </FilterField>

        <RatingFilter control={control} />

        <FilterField label="Min Number of Reviews">
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
                  step={1}
                  valueLabelDisplay="auto"
                  marks={reviewMarks}
                />
              </Box>
            )}
          />
        </FilterField>
      </>
    )}

    {mode === "posts" && (
      <>
        <FilterField label="Username">
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
                sx={textFieldSx}
              />
            )}
          />
        </FilterField>

        <RatingFilter control={control} />

        <FilterField label="Minimum Likes">
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
                  marks={postLikeMarks}
                />
              </Box>
            )}
          />
        </FilterField>
      </>
    )}
  </>
);

export default SearchFilterFields;
