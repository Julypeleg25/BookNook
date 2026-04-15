import { useParams, useLocation } from "react-router-dom";
import { useEffect, useRef, useMemo } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import CommentsSection, {
  type CommentsSectionRef,
} from "@components/post/comments/CommentsSection";
import BookPostHeader from "@components/bookHeaders/BookPostHeader";
import BookInfoSection from "@components/post/BookInfoSection";
import AiBookRecommendation from "@components/post/AiBookRecommendation";
import NotFound from "./NotFound";
import { useQuery } from "@tanstack/react-query";
import { userReviewService } from "@/api/services/userReviewService";
import type { Book, BookPost } from "@models/Book";
import env from "@/config/env";
import PostActionsMenu from "@components/bookCards/post/PostActionsMenu";

const AI_RESPONSE =
  "Based on your prompt and this review, I believe this book will fit you perfectly";

const BookPost = () => {
  const { id } = useParams<{ id: string }>();
  const { hash } = useLocation();
  const commentsRef = useRef<CommentsSectionRef>(null);

  const {
    data: review,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["review", id],
    queryFn: () => userReviewService.getReviewById(id!),
    enabled: !!id,
  });

  const bookPost: BookPost | null = useMemo(() => review
    ? {
      id: review._id,
      book: review.book as Book,
      user: {
        id: review.user._id,
        username: review.user.username,
        avatar: review.user.avatar,
      },
      createdDate: review.createdAt,
      description: review.review,
      rating: review.rating,
      imageUrl: review.picturePath || review.imageUrl,
      likes: review.likes || [],
      comments: (review.comments || []).map((c: import("@models/UserReview").ReviewComment) => ({
        id: c._id,
        user: {
          id: c.user?.id || (c.user as unknown as string),
          username: c.user?.username || "Unknown",
          avatar: c.user?.avatar,
        },
        createdDate: c.createdAt,
        content: c.comment,
      })),
    }
    : null, [review]);

  useEffect(() => {
    if (hash === "#comments" && commentsRef.current) {
      commentsRef.current.focusInput();
      document
        .getElementById("comments-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash, bookPost]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !bookPost) return <NotFound />;


  return (
    <div style={{ margin: "3rem" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <BookPostHeader bookPost={bookPost} />
        <PostActionsMenu post={bookPost} />
      </Box>
      <Box
        display="grid"
        gap="2rem"
        gridTemplateColumns={{ xs: "1fr", md: "60% 40%" }}
        width="100%"
        alignItems="center"
        mt="2rem"
      >
        <Typography variant="subtitle1" sx={{ whiteSpace: "pre-wrap" }}>
          {bookPost.description}
        </Typography>
        {(() => {
          const rawUrl = bookPost.imageUrl;
          const resolvedUrl = rawUrl
            ? rawUrl.startsWith("http")
              ? rawUrl
              : `${env.API_BASE_URL}${rawUrl}`
            : (bookPost.book.thumbnail ?? null);
          return resolvedUrl ? (
            <img
              src={resolvedUrl}
              style={{ borderRadius: "1rem", maxWidth: "100%" }}
              alt="Review visual"
            />
          ) : null;
        })()}
      </Box>
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
        gap="2rem"
        mt="2rem"
      >
        <BookInfoSection book={bookPost.book} />
      </Box>
      <div id="comments-section">
        <CommentsSection ref={commentsRef} bookPost={bookPost} />
      </div>
    </div>
  );
};

export default BookPost;
