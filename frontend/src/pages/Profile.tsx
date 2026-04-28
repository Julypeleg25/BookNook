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
import { LuBookCheck } from "react-icons/lu";
import { MdEdit, MdPostAdd } from "react-icons/md";
import ProfileForm from "@components/profile/ProfileForm";
import MyPosts from "./MyPosts";
import useUserStore from "@/state/useUserStore";
import { getAvatarSrcUrl } from "@/utils/userUtils";
import { userReviewService } from "@/api/services/userReviewService";
import { ListsService } from "@/api/services/ListsService";
import { queryKeys } from "@/api/queryKeys";
import { RATING_STEP } from "@shared/constants/validation";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { user } = useUserStore();

  const { data: reviews = [], isLoading: isReviewsLoading } = useQuery({
    queryKey: queryKeys.allReviewsByUsername(user.username),
    queryFn: () => userReviewService.getAllReviews(0, "", user.username, 0, ""),
    enabled: !!user.username,
  });

  const { data: readlistBooks = [], isLoading: isReadlistLoading } = useQuery({
    queryKey: queryKeys.readlist(user.username),
    queryFn: ListsService.getReadlistBooks,
    enabled: !!user.username,
  });

  const { data: wishlistBooks = [], isLoading: isWishlistLoading } = useQuery({
    queryKey: queryKeys.wishlist(user.username),
    queryFn: ListsService.getWishlistBooks,
    enabled: !!user.username,
  });

  const profileStats = useMemo(() => {
    const totalLikes = reviews.reduce((sum, review) => sum + review.likes.length, 0);
    const totalComments = reviews.reduce((sum, review) => sum + review.comments.length, 0);
    const averageRating = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    const genreCounts = new Map<string, number>();
    reviews.forEach((review) => {
      if (typeof review.book !== "object") return;
      const genres = review.book.categories ?? review.book.genres ?? [];
      genres.forEach((genre) => genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1));
    });

    const favoriteGenres = [...genreCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre);

    return {
      averageRating,
      favoriteGenres,
      totalComments,
      totalLikes,
    };
  }, [reviews]);

  const isStatsLoading = isReviewsLoading || isReadlistLoading || isWishlistLoading;

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
                  <StatTile icon={<LuBookCheck />} label="Readlist" value={readlistBooks.length} loading={isReadlistLoading} />
                  <StatTile icon={<BsBookmark />} label="Wishlist" value={wishlistBooks.length} loading={isWishlistLoading} />
                  <StatTile icon={<FiHeart />} label="Likes received" value={profileStats.totalLikes} loading={isReviewsLoading} />
                </Box>

                <Box
                  display="grid"
                  gridTemplateColumns={{ xs: "1fr", md: "minmax(0, 1fr) minmax(18rem, 0.75fr)" }}
                  gap={2}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      bgcolor: "rgba(91, 111, 106, 0.035)",
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Typography fontWeight={800}>Reading Taste</Typography>
                      {isStatsLoading ? (
                        <CircularProgress size={22} />
                      ) : profileStats.favoriteGenres.length > 0 ? (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {profileStats.favoriteGenres.map((genre) => (
                            <Chip key={genre} label={genre} size="small" />
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Review a few books to build a taste profile.
                        </Typography>
                      )}
                    </Stack>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      bgcolor: "rgba(91, 111, 106, 0.035)",
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Typography fontWeight={800}>Review Activity</Typography>
                      {isReviewsLoading ? (
                        <CircularProgress size={22} />
                      ) : reviews.length > 0 ? (
                        <>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Rating value={profileStats.averageRating} precision={RATING_STEP} readOnly size="small" />
                            <Typography variant="body2" color="text.secondary">
                              {profileStats.averageRating.toFixed(1)} avg
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                            <FiMessageCircle />
                            <Typography variant="body2">
                              {profileStats.totalComments} comments on your posts
                            </Typography>
                          </Stack>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Your review stats will appear here after your first post.
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                  <Button startIcon={<FiPlus />} onClick={() => navigate("/books/select")}>
                    Create Post
                  </Button>
                  <Button variant="outlined" startIcon={<LuBookCheck />} onClick={() => navigate("/lists")}>
                    View Lists
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

export default Profile;
