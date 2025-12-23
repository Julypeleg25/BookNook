import { useParams } from "react-router-dom";
import { bookPosts } from "../exampleData";
import { useMemo } from "react";
import NotFound from "./NotFound";
import { Box, Typography } from "@mui/material";
import CommentsSection from "../components/searchFilters/sections/CommentsSection";
import BookPostHeader from "../components/BookPostHeader";

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
      <div style={{ border: "solid", height: "30rem", margin: "1rem" }}>
        Not sure if this book fits you? describe what you like shortly and we'll
        try to find out!
      </div>
    </div>
  );
};

export default BookPost;
