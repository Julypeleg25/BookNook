import { Box } from "@mui/material";
import { useMemo } from "react";
import { useInfiniteLoader } from "@hooks/useInfiniteLoader";
import type { BookPost, Book } from "@models/Book";
import { UserReview, ReviewComment } from "@/models/UserReview";
import { useQuery } from "@tanstack/react-query";
import useUserStore from "@/state/useUserStore";
import { userReviewService } from "@/api/services/userReviewService";
import BookPostCard from "@/components/bookCards/post/BookPostCard";
import PostCardSkeleton from "@/components/bookCards/post/PostCardSkeleton";
import { Typography } from "@mui/material";

const BATCH_SIZE = 8;

const MyPosts = () => {
  const {
    user: { username },
  } = useUserStore();
  const { data: reviews = [], isLoading, isError } = useQuery({
    queryKey: ["allReviews", username],
    queryFn: () => userReviewService.getAllReviews(0, "", username, 0, ""),
  });

  const bookPosts: BookPost[] = useMemo(
    () =>
      reviews.map((r: UserReview) => ({
        id: r._id,
        book: r.book as Book,
        user: {
          id: r.user._id,
          username: r.user.username,
          avatar: r.user.avatar,
        },
        createdDate: r.createdAt,
        description: r.review,
        rating: r.rating,
        imageUrl: r.picturePath,
        likes: r.likes,
        comments: r.comments.map((c: ReviewComment) => ({
          id: c._id,
          user: {
            id: c.user.id,
            username: c.user.username,
            avatar: c.user.avatar,
          },
          createdDate: c.createdAt,
          content: c.comment,
        })),
      })),
    [reviews],
  );
  const { visibleItems, loaderRef } = useInfiniteLoader<BookPost>({
    items: bookPosts,
    batchSize: BATCH_SIZE,
    rootMargin: "50px",
  });

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        My posts
      </Typography>

      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "1fr 1fr",
          md: "1fr 1fr 1fr",
        }}
        gap="1.5rem"
      >
        {isLoading
          ? [...Array(BATCH_SIZE)].map((_, i) => <PostCardSkeleton key={i} />)
          : visibleItems.map((post) => (
            <BookPostCard key={post.id} post={post} />
          ))}
      </Box>

      {isError && (
        <Typography color="error" sx={{ textAlign: "center", mt: 4 }}>
          Error loading posts. Please try again.
        </Typography>
      )}

      {!isLoading && bookPosts.length === 0 && (
        <Typography sx={{ textAlign: "center", mt: 4 }} color="text.secondary">
          No posts yet.
        </Typography>
      )}

      {visibleItems.length < bookPosts.length && <Box ref={loaderRef} sx={{ height: 20 }} />}
    </Box>
  );
};

export default MyPosts;
