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
    <Box
      sx={{
        minHeight: "calc(100vh - 4.5rem)",
        bgcolor: "background.default",
        px: { xs: 2, md: 4 },
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: "76rem", mx: "auto" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 2,
          }}
        >
          <BookPostHeader bookPost={bookPost} />
          <PostActionsMenu post={bookPost} />
        </Box>
        <Box
          display="grid"
          gap="2rem"
          gridTemplateColumns={{ xs: "1fr", md: "minmax(0, 1.2fr) minmax(20rem, 0.8fr)" }}
          width="100%"
          alignItems="stretch"
          mt="2rem"
        >
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "1rem",
            minHeight: "14rem",
            display: "flex",
            alignItems: "flex-start",
            bgcolor: "background.paper",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              lineHeight: 1.8,
            }}
          >
            {bookPost.description}
          </Typography>
        </Box>
        {(() => {
          const rawUrl = bookPost.imageUrl;
          const resolvedUrl = rawUrl
            ? rawUrl.startsWith("http")
              ? rawUrl
              : `${env.API_BASE_URL}${rawUrl}`
            : (bookPost.book.thumbnail ?? null);
          return resolvedUrl ? (
            <Box
              sx={{
                width: "100%",
                minHeight: "14rem",
                maxHeight: { xs: "24rem", md: "34rem" },
                borderRadius: "1rem",
                backgroundColor: "grey.100",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Box
                component="img"
                src={resolvedUrl}
                alt="Review visual"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </Box>
          ) : null;
        })()}
        </Box>
        <Box mt="2rem">
          <BookInfoSection book={bookPost.book} />
        </Box>
        <div id="comments-section">
          <CommentsSection ref={commentsRef} bookPost={bookPost} />
        </div>
      </Box>
    </Box>
  );
};

export default BookPost;
