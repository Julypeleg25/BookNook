import {
  Box,
  CircularProgress,
  Paper,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { FiHeart, FiMessageCircle } from "react-icons/fi";
import { RATING_STEP } from "@shared/constants/validation";

interface ReviewActivityProps {
  isLoading: boolean;
  reviewsCount: number;
  averageRating: number;
  totalComments: number;
  totalLikes: number;
}

interface ActivityMetricProps {
  children: React.ReactNode;
  label: string;
}

const ActivityMetric = ({ children, label }: ActivityMetricProps) => (
  <Box
    sx={{
      p: 1.5,
      minHeight: "4.75rem",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 2,
      bgcolor: "background.paper",
    }}
  >
    <Stack spacing={0.75}>
      <Typography variant="caption" color="text.secondary" fontWeight={800}>
        {label}
      </Typography>
      {children}
    </Stack>
  </Box>
);

export const ReviewActivity = ({
  isLoading,
  reviewsCount,
  averageRating,
  totalComments,
  totalLikes,
}: ReviewActivityProps) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, md: 2.5 },
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 2,
      bgcolor: "rgba(91, 111, 106, 0.035)",
    }}
  >
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        gap={1}
      >
        <Box>
          <Typography fontWeight={800}>Review Activity</Typography>
          <Typography variant="body2" color="text.secondary">
            A quick pulse on how your posts are doing.
          </Typography>
        </Box>
      </Stack>

      {isLoading ? (
        <CircularProgress size={22} />
      ) : reviewsCount > 0 ? (
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }}
          gap={1.25}
        >
          <ActivityMetric label="Average rating">
            <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
              <Rating
                value={averageRating}
                precision={RATING_STEP}
                readOnly
                size="small"
              />
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={700}
              >
                {averageRating.toFixed(1)}
              </Typography>
            </Stack>
          </ActivityMetric>
          <ActivityMetric label="Comments to me">
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              color="text.secondary"
            >
              <FiMessageCircle />
              <Typography variant="h6" color="text.primary" fontWeight={800}>
                {totalComments}
              </Typography>
            </Stack>
          </ActivityMetric>
          <ActivityMetric label="Likes to me">
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              color="text.secondary"
            >
              <FiHeart />
              <Typography variant="h6" color="text.primary" fontWeight={800}>
                {totalLikes}
              </Typography>
            </Stack>
          </ActivityMetric>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Your review stats will appear here after your first post.
        </Typography>
      )}
    </Stack>
  </Paper>
);
