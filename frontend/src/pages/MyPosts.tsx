import FullBookPostCard from "@components/bookCards/FullBookPostCard";
import { bookPosts } from "../exampleData";
import { Box } from "@mui/material";
import { useMemo } from "react";
import { useInfiniteLoader } from "@hooks/useInfiniteLoader";
import type { BookPost } from "@models/Book";

const user_id = "u1";
const BATCH_SIZE = 5;

const MyPosts = () => {
  const exampleUserPosts = useMemo(
    () => bookPosts.filter((post) => post.user.id === user_id),
    []
  );

  const { visibleItems, loaderRef } = useInfiniteLoader<BookPost>({
    items: exampleUserPosts,
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

      {visibleItems.length < exampleUserPosts.length && <Box ref={loaderRef} />}
    </Box>
  );
};

export default MyPosts;
