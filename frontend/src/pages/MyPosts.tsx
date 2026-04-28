import { Box } from "@mui/material";
import { useMemo } from "react";
import { useInfiniteLoader } from "@hooks/useInfiniteLoader";
import type { BookPost } from "@models/Book";
import { useQuery } from "@tanstack/react-query";
import useUserStore from "@/state/useUserStore";
import { userReviewService } from "@/api/services/userReviewService";
import BookPostCard from "@/components/bookCards/post/BookPostCard";
import PostCardSkeleton from "@/components/bookCards/post/PostCardSkeleton";
import { Typography } from "@mui/material";
import { queryKeys } from "@/api/queryKeys";
import { mapReviewToBookPost } from "@/utils/reviewUtils";

const BATCH_SIZE = 8;

interface MyPostsProps {
  disablePadding?: boolean;
}

const MyPosts = ({ disablePadding }: MyPostsProps) => {
  const {
    user: { username },
  } = useUserStore();
  const { data: reviews = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.allReviewsByUsername(username),
    queryFn: () => userReviewService.getAllReviews(0, "", username, 0, ""),
  });

  const bookPosts: BookPost[] = useMemo(
    () => reviews.map(mapReviewToBookPost),
    [reviews],
  );
  const { visibleItems, loaderRef } = useInfiniteLoader<BookPost>({
    items: bookPosts,
    batchSize: BATCH_SIZE,
    rootMargin: "50px",
  });

  return (
    <Box sx={{ width: "100%", p: disablePadding ? 0 : 4, pt: disablePadding ? 0 : 2 }}>
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
