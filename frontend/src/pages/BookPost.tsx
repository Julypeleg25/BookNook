import { useParams } from "react-router-dom";
import { bookPosts } from "../exampleData";
import { useMemo } from "react";
import NotFound from "./NotFound";
import { Box, Rating, Typography } from "@mui/material";
import { FaCalendar, FaUser } from "react-icons/fa6";
import { formatDate } from "../utils/dateUtils";
import CommentsSection from "../components/searchFilters/sections/CommentsSection";

const BookPostDetails = () => {
  const { id } = useParams<{ id: string }>();

  const bookPost = useMemo(
    () => bookPosts.find((post) => post.id === id),
    [id]
  );

  if (!bookPost) return <NotFound />;

  return (
    <div style={{ margin: "3rem" }}>
      <Box
        display="grid"
        gap="2rem"
        gridTemplateColumns="70% 30%"
        width="100%"
        marginTop={"2rem"}
        alignItems={"center"}
      >
        <div style={{ display: "grid" }}>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "3rem" }}>{bookPost.book.title}</div>
            <div
              style={{
                fontSize: "2.5rem",
                marginRight: "1rem",
              }}
            >
              ({new Date(bookPost.book.publishedDate).getFullYear()})
            </div>
            <Rating size="large" value={bookPost.rating} />
          </div>
          <Typography variant="h5" style={{ display: "flex", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "0.3rem" }}>
              <FaCalendar />
              {formatDate(bookPost.createdDate)}
            </div>
            <div style={{ display: "flex", gap: "0.3rem" }}>
              <FaUser />
              {bookPost.user.username}
            </div>
          </Typography>
          <Typography marginTop={"1.5rem"} fontSize={"1.2rem"}>
            {bookPost.description}
          </Typography>
        </div>
        <img
          src={bookPost.imageUrl}
          style={{ borderRadius: "1rem" }}
          width={"100%"}
        />
      </Box>
      <CommentsSection bookPost={bookPost} />
      <div style={{ border: "solid", height: "30rem",margin:'1rem' }}>
        Not sure if this book fits you? describe what you like shortly and we'll try to find out!
      </div>
    </div>
  );
};

export default BookPostDetails;
