import { useParams } from "react-router-dom";
import { bookPosts } from "../exampleData";
import { useMemo } from "react";
import NotFound from "./NotFound";
import { Box, Typography } from "@mui/material";
import { BiUser } from "react-icons/bi";
import { CgUser } from "react-icons/cg";
import { FaUser } from "react-icons/fa6";

const BookPostDetails = () => {
  const { id } = useParams<{ id: string }>();

  const bookPost = useMemo(
    () => bookPosts.find((post) => post.id === id),
    [id]
  );

  if (!bookPost) {
    return <NotFound />;
  }

  return (
    <div style={{ margin: "1rem", gap: "1rem" }}>
      <div style={{ display: "flex", gap: "1rem" }}>
        <img src={bookPost.imageUrl} style={{ borderRadius: "1rem" }} />
        <div style={{ display: "grid" }}>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Typography variant="h4">{bookPost.book.title}</Typography>
            <Typography variant="h5" style={{ display: "flex", gap: "1rem" }}>
              {bookPost.createdDate.toDateString()}
              <div style={{ display: "flex", gap: "0.3rem" }}>
                <FaUser />
                {bookPost.user.username}
              </div>
            </Typography>
          </div>
          <Typography>{bookPost.description}</Typography>
        <Box style={{border:'1rem  0 black'}}>
          {bookPost.comments.map((comment) => (
            <div>{comment.content}</div>
          ))}
        </Box>
          </div>
      </div>
    </div>
  );
};

export default BookPostDetails;
