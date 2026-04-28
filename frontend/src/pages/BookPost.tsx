import { useParams, useLocation } from "react-router-dom";
import { useEffect, useRef, useMemo } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import CommentsSection, {
  type CommentsSectionRef,
} from "@components/post/comments/CommentsSection";
import BookPostHeader from "@components/bookHeaders/BookPostHeader";
import BookInfoSection from "@components/post/BookInfoSection";
import NotFound from "./NotFound";
import { useQuery } from "@tanstack/react-query";
import { userReviewService } from "@/api/services/userReviewService";
import type { BookPost } from "@models/Book";
import env from "@/config/env";
import PostActionsMenu from "@components/bookCards/post/PostActionsMenu";
import { mapReviewToBookPost } from "@/utils/reviewUtils";
import { queryKeys } from "@/api/queryKeys";

const BookPost = () => {
  const { id } = useParams<{ id: string }>();
  const { hash } = useLocation();
  const commentsRef = useRef<CommentsSectionRef>(null);

  const {
    data: review,
    isLoading,
    isError,
  } = useQuery({
    queryKey: id ? queryKeys.review(id) : queryKeys.reviewPrefix,
    queryFn: () => userReviewService.getReviewById(id!),
    enabled: !!id,
  });

  const bookPost: BookPost | null = useMemo(
    () => (review ? mapReviewToBookPost(review) : null),
    [review],
  );

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
        <Typography
          variant="subtitle1"
          sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
        >
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
            <Box
              component="img"
              src={resolvedUrl}
              alt="Review visual"
              sx={{
                width: "100%",
                maxHeight: { xs: "22rem", md: "34rem" },
                objectFit: "contain",
                borderRadius: "1rem",
                backgroundColor: "grey.100",
              }}
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
