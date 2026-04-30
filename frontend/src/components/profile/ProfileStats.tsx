import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { BsBookmark } from "react-icons/bs";
import { FiHeart, FiMessageCircle } from "react-icons/fi";
import { MdPostAdd } from "react-icons/md";

interface ProfileStatsProps {
  reviewsCount: number;
  wishlistCount: number;
  commentGivenCount: number;
  likesGivenCount: number;
  isReviewsLoading: boolean;
  isWishlistLoading: boolean;
  isAllReviewsLoading: boolean;
}

interface StatTileProps {
  icon: React.ReactNode;
  label: string;
  loading?: boolean;
  value: number;
}

const StatTile = ({ icon, label, loading, value }: StatTileProps) => (
  <Box
    sx={{
      p: 2,
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 2,
      bgcolor: "rgba(91, 111, 106, 0.035)",
      minHeight: "6.25rem",
    }}
  >
    <Stack spacing={1}>
      <Box
        sx={{
          width: "2.25rem",
          height: "2.25rem",
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: "rgba(91, 111, 106, 0.12)",
          color: "primary.main",
          "& svg": { width: "1.2rem", height: "1.2rem" },
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={800}>
        {loading ? <CircularProgress size={20} /> : value}
      </Typography>
    </Stack>
  </Box>
);

export const ProfileStats = ({
  reviewsCount,
  wishlistCount,
  commentGivenCount,
  likesGivenCount,
  isReviewsLoading,
  isWishlistLoading,
  isAllReviewsLoading,
}: ProfileStatsProps) => (
  <Box
    display="grid"
    gridTemplateColumns={{
      xs: "1fr",
      sm: "repeat(2, minmax(0, 1fr))",
      lg: "repeat(4, minmax(0, 1fr))",
    }}
    gap={1.5}
  >
    <StatTile
      icon={<MdPostAdd />}
      label="Posts"
      value={reviewsCount}
      loading={isReviewsLoading}
    />
    <StatTile
      icon={<BsBookmark />}
      label="Wishlist"
      value={wishlistCount}
      loading={isWishlistLoading}
    />
    <StatTile
      icon={<FiMessageCircle />}
      label="Comments given"
      value={commentGivenCount}
      loading={isAllReviewsLoading}
    />
    <StatTile
      icon={<FiHeart />}
      label="Likes given"
      value={likesGivenCount}
      loading={isAllReviewsLoading}
    />
  </Box>
);
