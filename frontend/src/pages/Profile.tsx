import { Box, Divider, Paper, Stack } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ProfileForm from "@components/profile/ProfileForm";
import { ProfileHeader } from "@components/profile/ProfileHeader";
import { ProfileStats } from "@components/profile/ProfileStats";
import { ReviewActivity } from "@components/profile/ReviewActivity";
import { ProfileActions } from "@components/profile/ProfileActions";
import MyPosts from "./MyPosts";
import useUserStore from "@/state/useUserStore";
import { userReviewService } from "@/api/services/userReviewService";
import { WishlistService } from "@/api/services/WishlistService";
import { queryKeys } from "@/api/queryKeys";
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
    queryFn: WishlistService.getWishlistBooks,
    enabled: !!user.username,
  });

  const profileStats = useMemo(() => {
    const totalLikes = reviews.reduce(
      (sum, review) => sum + review.likes.length,
      0,
    );
    const totalComments = reviews.reduce(
      (sum, review) => sum + review.comments.length,
      0,
    );
    const totalLikesGiven = allReviews.reduce(
      (sum, review) => sum + (review.likes.includes(user.id) ? 1 : 0),
      0,
    );
    const totalCommentsGiven = allReviews.reduce(
      (sum, review) =>
        sum +
        review.comments.filter(
          (comment) => getCommentUser(comment.user).id === user.id,
        ).length,
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
            <ProfileHeader
              user={user}
              isEditing={isEditing}
              onEditClick={() => setIsEditing(true)}
            />

            {isEditing ? (
              <>
                <Divider />
                <ProfileForm onCancel={() => setIsEditing(false)} />
              </>
            ) : (
              <>
                <Divider />

                <ProfileStats
                  reviewsCount={reviews.length}
                  wishlistCount={wishlistBooks.length}
                  commentGivenCount={profileStats.totalCommentsGiven}
                  likesGivenCount={profileStats.totalLikesGiven}
                  isReviewsLoading={isReviewsLoading}
                  isWishlistLoading={isWishlistLoading}
                  isAllReviewsLoading={isAllReviewsLoading}
                />

                <ReviewActivity
                  isLoading={isReviewsLoading}
                  reviewsCount={reviews.length}
                  averageRating={profileStats.averageRating}
                  totalComments={profileStats.totalComments}
                  totalLikes={profileStats.totalLikes}
                />

                <ProfileActions
                  onCreatePost={() => navigate("/books/select")}
                  onViewWishlist={() => navigate("/wishlist")}
                />
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

export default Profile;
