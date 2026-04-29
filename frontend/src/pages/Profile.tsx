import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BsBookmark } from "react-icons/bs";
import { FiHeart, FiMail, FiMessageCircle, FiPlus } from "react-icons/fi";
import { MdEdit, MdPostAdd } from "react-icons/md";
import ProfileForm from "@components/profile/ProfileForm";
import MyPosts from "./MyPosts";
import useUserStore from "@/state/useUserStore";
import { getAvatarSrcUrl } from "@/utils/userUtils";
import { userReviewService } from "@/api/services/userReviewService";
import { ListsService } from "@/api/services/ListsService";
import { queryKeys } from "@/api/queryKeys";
import { RATING_STEP } from "@shared/constants/validation";
import { getCommentUser } from "@/utils/reviewUtils";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { user } = useUserStore();

  const { data: reviews = [], isLoading: isReviewsLoading } = useQuery({
    queryKey: queryKeys.allReviewsByUserId(user.id),
    queryFn: () => userReviewService.getReviewsByUserId(user.id),
    enabled: !!user.id,
  });

  const { data: allReviews = [], isLoading: isAllReviewsLoading } = useQuery({
    queryKey: queryKeys.allReviews,
    queryFn: () => userReviewService.getAllReviews(),
    enabled: !!user.id,
  });

  const { data: wishlistBooks = [], isLoading: isWishlistLoading } = useQuery({
    queryKey: queryKeys.wishlist(user.username),
    queryFn: ListsService.getWishlistBooks,
    enabled: !!user.username,
  });

  const profileStats = useMemo(() => {
    const totalLikes = reviews.reduce((sum, review) => sum + review.likes.length, 0);
    const totalComments = reviews.reduce((sum, review) => sum + review.comments.length, 0);
    const totalLikesGiven = allReviews.reduce(
      (sum, review) => sum + (review.likes.includes(user.id) ? 1 : 0),
      0,
    );
    const totalCommentsGiven = allReviews.reduce(
      (sum, review) =>
        sum + review.comments.filter((comment) => getCommentUser(comment.user).id === user.id).length,
      0,
    );
    const averageRating = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    return {
      averageRating,
      totalComments,
      totalCommentsGiven,
      totalLikes,
      totalLikesGiven,
    };
  }, [allReviews, reviews, user.id]);

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 4.5rem)",
        bgcolor: "background.default",
        px: { xs: 2, md: 4 },
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Stack spacing={3} sx={{ width: "100%", maxWidth: "76rem", mx: "auto" }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              gap={3}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} alignItems={{ xs: "flex-start", sm: "center" }}>
                <Avatar
                  src={getAvatarSrcUrl(user.avatar)}
                  sx={{
                    width: { xs: "5rem", md: "6rem" },
                    height: { xs: "5rem", md: "6rem" },
                    border: "4px solid",
                    borderColor: "background.paper",
                    boxShadow: "0 14px 30px rgba(31, 41, 51, 0.16)",
                  }}
                />
                <Box minWidth={0}>
                  <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0, fontWeight: 800 }}>
                    Reader Profile
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ overflowWrap: "anywhere" }}>
                    {user.username || "BookNook reader"}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                    <Chip label={`@${user.username || "reader"}`} size="small" />
                    {user.email && (
                      <Chip
                        icon={<FiMail size={15} />}
                        label={user.email}
                        size="small"
                        variant="outlined"
                        sx={{ maxWidth: "100%", "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } }}
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>

              {!isEditing && (
                <IconButton
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit profile"
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <MdEdit size="1.4rem" />
                </IconButton>
              )}
            </Stack>

            {isEditing ? (
              <>
                <Divider />
                <ProfileForm onCancel={() => setIsEditing(false)} />
              </>
            ) : (
              <>
                <Divider />

                <Box
                  display="grid"
                  gridTemplateColumns={{
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(4, minmax(0, 1fr))",
                  }}
                  gap={1.5}
                >
                  <StatTile icon={<MdPostAdd />} label="Posts" value={reviews.length} loading={isReviewsLoading} />
                  <StatTile icon={<BsBookmark />} label="Wishlist" value={wishlistBooks.length} loading={isWishlistLoading} />
                  <StatTile icon={<FiMessageCircle />} label="Comments given" value={profileStats.totalCommentsGiven} loading={isAllReviewsLoading} />
                  <StatTile icon={<FiHeart />} label="Likes given" value={profileStats.totalLikesGiven} loading={isAllReviewsLoading} />
                </Box>

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
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1}>
                      <Box>
                        <Typography fontWeight={800}>Review Activity</Typography>
                        <Typography variant="body2" color="text.secondary">
                          A quick pulse on how your posts are doing.
                        </Typography>
                      </Box>
                    </Stack>

                    {isReviewsLoading ? (
                      <CircularProgress size={22} />
                    ) : reviews.length > 0 ? (
                      <Box
                        display="grid"
                        gridTemplateColumns={{ xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }}
                        gap={1.25}
                      >
                        <ActivityMetric label="Average rating">
                          <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
                            <Rating value={profileStats.averageRating} precision={RATING_STEP} readOnly size="small" />
                            <Typography variant="body2" color="text.secondary" fontWeight={700}>
                              {profileStats.averageRating.toFixed(1)}
                            </Typography>
                          </Stack>
                        </ActivityMetric>
                        <ActivityMetric label="Comments to me">
                          <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                            <FiMessageCircle />
                            <Typography variant="h6" color="text.primary" fontWeight={800}>
                              {profileStats.totalComments}
                            </Typography>
                          </Stack>
                        </ActivityMetric>
                        <ActivityMetric label="Likes to me">
                          <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                            <FiHeart />
                            <Typography variant="h6" color="text.primary" fontWeight={800}>
                              {profileStats.totalLikes}
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

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                  <Button startIcon={<FiPlus />} onClick={() => navigate("/books/select")}>
                    Create Post
                  </Button>
                  <Button variant="outlined" startIcon={<BsBookmark />} onClick={() => navigate("/lists")}>
                    View Wishlist
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </Paper>

        <Box sx={{ width: "100%" }}>
          <MyPosts disablePadding />
        </Box>
      </Stack>
    </Box>
  );
};

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

export default Profile;
