import FullBookPostCard from "../components/bookCards/FullBookPostCard";
import { bookPosts } from "../exampleData";
import myPostsIcon from "../assets/posts-page.png";
import { Box, Grow } from "@mui/material";
import type { BookPost } from "../models/Book";
import { useEffect, useMemo, useRef, useState } from "react";

const user_id = "u1"; //TODO: Example user ID
const exampleUserPosts = bookPosts.filter((post) => post.user.id === user_id);

const BATCH_SIZE = 5;

const MyPosts = () => {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loaderRef.current || visibleCount >= exampleUserPosts.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((v) =>
            Math.min(v + BATCH_SIZE, exampleUserPosts.length)
          );
        }
      },
      { rootMargin: "150px" }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [visibleCount]);

  const visiblePosts = useMemo(
    () => exampleUserPosts.slice(0, visibleCount),
    [visibleCount]
  );

  return (
    <div
      style={{
        padding: "1rem",
        margin: "1.2rem",
        display: "grid",
        gap: "2rem",
        borderRadius: "1rem",
        maxWidth: "80%",
        width: "70rem",
      }}
    >
      <h2>My posts</h2>

      <img
        src={myPostsIcon}
        style={{
          position: "absolute",
          transform: "scaleX(-1)",
          top: 120,
          right: 150,
        }}
      />
      {visiblePosts.map((post: BookPost, i: number) => (
        <Grow in timeout={200 + i * 50} key={post.id}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              fontSize: "1rem",
              fontWeight: 500,
            }}
            key={post.id}
          >
            <FullBookPostCard key={post.id} post={post} />
          </div>
        </Grow>
      ))}
      <Box ref={loaderRef} />
    </div>
  );
};
export default MyPosts;
