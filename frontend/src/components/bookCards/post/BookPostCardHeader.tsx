import { CardHeader, CardMedia, Typography, Box, Avatar } from "@mui/material";
import type { BookPost } from "@models/Book";
import { Link as RouterLink } from "react-router-dom";
import { getAvatarSrcUrl } from "@/utils/userUtils";

interface BookPostCardProps {
  post: BookPost;
}

const BookPostCardHeader = ({ post }: BookPostCardProps) => {
  return (
    <>
      <CardHeader
        avatar={
          <Avatar
            src={getAvatarSrcUrl(post.user.avatar)}
            alt={post.user.name}
          />
        }
        title={
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              transition: "text-decoration 0.2s ease",
            }}
          >
            {post.book.title}
          </Typography>
        }
        subheader={
          <Box gap={"0.3rem"} display={"grid"}>
            <div>@{post.user.username}</div>
            {post.createdDate.toDateString()}
          </Box>
        }
      />

      <Box
        component={RouterLink}
        to={`/posts/${post.id}`}
        sx={{ textDecoration: "none" }}
      >
        <CardMedia
          component="img"
          image={post.imageUrl}
          sx={{ height: "16rem", objectFit: "cover" }}
        />
      </Box>
    </>
  );
};

export default BookPostCardHeader;
