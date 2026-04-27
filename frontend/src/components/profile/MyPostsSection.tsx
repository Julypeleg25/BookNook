import { Box, Button } from "@mui/material";
import type { BookPost } from "@models/Book";
import { useNavigate } from "react-router-dom";
import { bookPosts } from "@/exampleData";
import MyBookPostCard from "../bookCards/MyBookPostCard";

interface MyPostsSectionProps {
  postsCount: number;
}

const MyPostsSection = ({ postsCount }: MyPostsSectionProps) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: "1rem",
        backgroundColor: "#ece9e4ff",
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
        {bookPosts.slice(0,5).map((post: BookPost) => (
          <MyBookPostCard key={post.id} post={post} />
        ))}
      </Box>
    </div>
  );
};

export default MyPostsSection;
