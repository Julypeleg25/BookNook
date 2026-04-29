import { Rating, Stack, Typography } from "@mui/material";
import { RATING_MAX, RATING_STEP } from "@shared/constants/validation";
import { normalizeRating } from "./ratingUtils";

interface RatingFieldProps {
  value: number;
  error?: string;
  onBlur: () => void;
  onChange: (value: number) => void;
}

const RatingField = ({ value, error, onBlur, onChange }: RatingFieldProps) => (
  <Stack
    spacing={0.75}
    sx={{
      alignSelf: "flex-start",
      width: "fit-content",
      maxWidth: "100%",
      border: "1px solid",
      borderColor: error ? "error.main" : "divider",
      borderRadius: 2,
      px: 1.5,
      py: 1,
      bgcolor: "rgba(91, 111, 106, 0.025)",
    }}
  >
    <Typography fontWeight={800}>Rating</Typography>
    <Rating
      precision={RATING_STEP}
      value={value}
      onChange={(_, nextValue) => onChange(normalizeRating(nextValue))}
      onBlur={onBlur}
      max={RATING_MAX}
      sx={{
        alignSelf: "center",
        "& .MuiRating-icon": {
          fontSize: { xs: "1.6rem", sm: "1.75rem" },
        },
        "& .MuiRating-iconFilled": {
          color: "#F5B301",
        },
        "& .MuiRating-iconHover": {
          color: "#E6A700",
        },
      }}
    />
    {error && (
      <Typography variant="caption" color="error">
        {error}
      </Typography>
    )}
  </Stack>
);

export default RatingField;
