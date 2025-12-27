import { Box, Button } from "@mui/material";
import { bookPosts } from "../exampleData";
import type { BookPost } from "../models/Book";
import MyBookPostCard from "./bookCards/MyBookPostCard";
import { useNavigate } from "react-router-dom";

const user_id = "u1"; //TODO: Example user ID
const exampleUserPosts = bookPosts
  .filter((post) => post.user.id === user_id)
  .slice(0, 5);

interface MyPostsSectionProps {
  postsCount: number;
}

const MyPostsSection = ({ postsCount }: MyPostsSectionProps) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: "1rem",
        backgroundColor: "#f5f5f5",
        marginTop: "2rem",
        borderRadius: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h3>My Posts</h3>
        <Button variant="outlined" onClick={() => navigate("/myPosts")}>
          View all my posts ({postsCount})
        </Button>
      </div>
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "1fr 1fr",
          md: "1fr 1fr 1fr 1fr 1fr",
        }}
        gap={"2rem"}
      >
        {exampleUserPosts.map((post: BookPost) => (
          <MyBookPostCard key={post.id} post={post} />
        ))}
      </Box>
    </div>
  );
};

export default MyPostsSection;
