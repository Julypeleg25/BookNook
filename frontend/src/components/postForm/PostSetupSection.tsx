import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Controller } from "react-hook-form";
import PostImageUpload from "@components/common/PostImageUpload";
import type { PostFormValues } from "@/models/PostForm";
import RatingField from "./RatingField";
import { normalizeRating, validateRating } from "./ratingUtils";

interface PostSetupSectionProps {
  control: Control<PostFormValues>;
  errors: FieldErrors<PostFormValues>;
  setValue: UseFormSetValue<PostFormValues>;
}

const PostSetupSection = ({ control, errors, setValue }: PostSetupSectionProps) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, md: 2.5 },
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.paper",
    }}
  >
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
      >
        <Box>
          <Typography variant="h6" fontWeight={800} gutterBottom>
            Post Setup
          </Typography>
        </Box>
      </Stack>

      <Divider />

      <Stack spacing={2}>
        <Controller
          name="rating"
          control={control}
          rules={{
            validate: validateRating,
          }}
          render={({ field, fieldState }) => (
            <RatingField
              value={normalizeRating(field.value)}
              error={fieldState.error?.message}
              onBlur={field.onBlur}
              onChange={(nextRating) => {
                setValue("rating", nextRating, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
              }}
            />
          )}
        />

        <Controller
          name="image"
          control={control}
          rules={{
            validate: (value) =>
              (value instanceof File ||
                (typeof value === "string" && value.trim().length > 0)) ||
              "An image is required for every post",
          }}
          render={({ field }) => (
            <PostImageUpload
              value={field.value}
              onChange={field.onChange}
              error={!!errors.image}
              helperText={errors.image?.message}
            />
          )}
        />
      </Stack>
    </Stack>
  </Paper>
);

export default PostSetupSection;
