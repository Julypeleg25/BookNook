import { Box, Chip, Divider, Paper, Stack, TextField, Typography } from "@mui/material";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import {
  REVIEW_TEXT_MAX_LENGTH,
  REVIEW_TEXT_MIN_LENGTH,
} from "@shared/constants/validation";
import type { PostFormValues } from "@/models/PostForm";

interface ReviewEditorSectionProps {
  control: Control<PostFormValues>;
  errors: FieldErrors<PostFormValues>;
  reviewLength: number;
}

const ReviewEditorSection = ({ control, errors, reviewLength }: ReviewEditorSectionProps) => (
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
            Write Review
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Share what you thought, what stood out, and who might enjoy it.
          </Typography>
        </Box>
        <Chip
          label={`${reviewLength}/${REVIEW_TEXT_MAX_LENGTH}`}
          variant="outlined"
          size="small"
        />
      </Stack>

      <Divider />

      <Controller
        name="review"
        control={control}
        rules={{
          required: "Review is required",
          minLength: {
            value: REVIEW_TEXT_MIN_LENGTH,
            message: `Minimum ${REVIEW_TEXT_MIN_LENGTH} characters`,
          },
          maxLength: {
            value: REVIEW_TEXT_MAX_LENGTH,
            message: `Max ${REVIEW_TEXT_MAX_LENGTH} characters`,
          },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            slotProps={{ htmlInput: { maxLength: REVIEW_TEXT_MAX_LENGTH } }}
            label="Review"
            placeholder="What stood out, who is this book for, and how did it make you feel?"
            multiline
            minRows={7}
            maxRows={14}
            fullWidth
            error={!!errors.review}
            helperText={
              errors.review
                ? errors.review.message
                : reviewLength < REVIEW_TEXT_MIN_LENGTH
                  ? `Minimum ${REVIEW_TEXT_MIN_LENGTH} characters`
                  : `${reviewLength}/${REVIEW_TEXT_MAX_LENGTH}`
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                alignItems: "flex-start",
              },
            }}
          />
        )}
      />
    </Stack>
  </Paper>
);

export default ReviewEditorSection;
