import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Chip,
  IconButton,
  Rating,
  Typography,
  Stack,
  Box,
  Avatar,
  Link as MuiLink,
} from "@mui/material";
import type { BookPost } from "../../../models/Book";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { FaRegComment } from "react-icons/fa6";
import { FiHeart } from "react-icons/fi";
import BookPostCardActions from "./BookPostCardActions";

interface BookPostCardProps {
  post: BookPost;
}

const BookPostCardHeader = ({ post }: BookPostCardProps) => {
  return (
    <>
      <CardHeader
        avatar={<Avatar src={post.user.avatarUrl} alt={post.user.name} />}
        title={
          <MuiLink
            component={RouterLink}
            to={`/books/${post.book.id}`}
            underline="none"
            color="primary.main"
            sx={{
              transition: "color 0.2s ease",
              "&:hover": { color: "primary.light" },
            }}
          >
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                transition: "text-decoration 0.2s ease",
              }}
            >
              {post.book.title}
            </Typography>
          </MuiLink>
        }
        subheader={post.createdDate.toDateString()}
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
