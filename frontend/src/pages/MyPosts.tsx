import FullBookPostCard from "@components/bookCards/FullBookPostCard";
import { Box } from "@mui/material";
import { useMemo } from "react";
import { useInfiniteLoader } from "@hooks/useInfiniteLoader";
import type { BookPost } from "@models/Book";
import { useQuery } from "@tanstack/react-query";
import useUserStore from "@/state/useUserStore";
import { userReviewService } from "@/api/services/userReviewService";

const BATCH_SIZE = 5;

const MyPosts = () => {
  const {
    user: { username },
  } = useUserStore();
  const { data: reviews = [] } = useQuery({
    queryKey: ["allReviews", username],
    queryFn: () => userReviewService.getAllReviews(0, "", username, 0, ""),
  });

  const bookPosts: BookPost[] = useMemo(
    () =>
      reviews.map((r: any) => ({
        id: r._id,
        book: r.book,
        user: r.user,
        createdDate: r.createdDate,
        description: r.review,
        rating: r.rating,
        imageUrl: r.picturePath,
        likes: r.likes,
        comments: r.comments.map((c: any) => ({
          id: c._id,
          user: c.user,
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
    <Box
      sx={{
        display: "grid",
        gap: "1.25rem",
        borderRadius: "1rem",
        padding: "1rem",
        maxWidth: "70rem",
        width: "100%",
        margin: "0.75rem auto",
      }}
    >
      <h2>My posts</h2>

      {visibleItems.map((post) => (
        <FullBookPostCard key={post.id} post={post} />
      ))}

      {visibleItems.length < bookPosts.length && <Box ref={loaderRef} />}
    </Box>
  );
};

export default MyPosts;
