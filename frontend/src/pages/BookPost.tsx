import { useParams } from "react-router-dom";
import { bookPosts } from "../exampleData";
import { useMemo } from "react";
import NotFound from "./NotFound";
import { Box, Paper, Typography } from "@mui/material";
import CommentsSection from "../components/searchFilters/sections/CommentsSection";
import BookPostHeader from "../components/bookHeaders/BookPostHeader";

const BookPost = () => {
  const { id } = useParams<{ id: string }>();

  const bookPost = useMemo(
    () => bookPosts.find((post) => post.id === id),
    [id]
  );

  if (!bookPost) return <NotFound />;

  return (
    <div style={{ margin: "3rem" }}>
      <BookPostHeader bookPost={bookPost} />
      <Box
        display="grid"
        gap="2rem"
        gridTemplateColumns="60% 40%"
        width="100%"
        alignItems={"center"}
      >
        <Typography marginTop={"1.5rem"} fontSize={"1.2rem"}>
          {bookPost.description}
        </Typography>
        <img
          src={bookPost.imageUrl}
          style={{ borderRadius: "1rem" }}
          width={"100%"}
        />
      </Box>
      <CommentsSection bookPost={bookPost} />
      <Paper
        elevation={2}
        sx={{
          marginTop: "4rem",
          padding: "2rem",
          borderRadius: "1rem",
        }}
      >
        <Typography
          sx={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.8rem" }}
        >
          Not sure if this book fits you?
        </Typography>

        <Typography color="text.secondary">
          Describe what you like in a few words and we’ll help you decide if
          this book is right for you.
        </Typography>

        {/* future: input + action */}
      </Paper>
    </div>
  );
};

export default BookPost;
