import { useParams, useLocation } from "react-router-dom";
import { bookPosts } from "../exampleData";
import { useMemo, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import CommentsSection, {
  type CommentsSectionRef,
} from "../components/post/comments/CommentsSection";
import BookPostHeader from "../components/bookHeaders/BookPostHeader";
import BookInfoSection from "../components/post/BookInfoSection";
import AiBookRecommendation from "../components/post/AiBookRecommendation";
import NotFound from "./NotFound";

const AI_RESPONSE =
  "Based on your prompt and this review, I believe this book will fit you perfectly";

const BookPost = () => {
  const { id } = useParams<{ id: string }>();
  const { hash } = useLocation();
  const commentsRef = useRef<CommentsSectionRef>(null);

  const bookPost = useMemo(
    () => bookPosts.find((post) => post.id === id),
    [id]
  );

  useEffect(() => {
    if (hash === "#comments" && commentsRef.current) {
      commentsRef.current.focusInput();
      document
        .getElementById("comments-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash]);

  if (!bookPost) return <NotFound />;

  return (
    <div style={{ margin: "3rem" }}>
      <BookPostHeader bookPost={bookPost} />
      <Box
        display="grid"
        gap="2rem"
        gridTemplateColumns="60% 40%"
        width="100%"
        alignItems="center"
      >
        <Typography marginTop="1.5rem" variant="subtitle1">
          {bookPost.description}
        </Typography>
        <img
          src={bookPost.imageUrl}
          style={{ borderRadius: "1rem" }}
          width="100%"
        />
      </Box>
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
        gap="2rem"
        mt="2rem"
      >
        <BookInfoSection book={bookPost.book} />
        <AiBookRecommendation response={AI_RESPONSE} />
      </Box>
      <div id="comments-section">
        <CommentsSection ref={commentsRef} bookPost={bookPost} />
      </div>
    </div>
  );
};

export default BookPost;
