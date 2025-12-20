import { Box } from "@mui/material";
import BookPostCard from "../components/BookPostCard";
import { bookPosts } from "../exampleData";
import type { BookPost } from "../models/Book";

const Explore = () => {
  return (
    <Box
      display="grid"
      gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }}
      gap={"2rem"}
      padding={"1rem"}
    >
      {bookPosts.map((post: BookPost) => (
        <BookPostCard key={post.id} book={post} />
      ))}
    </Box>
  );
};
export default Explore;
