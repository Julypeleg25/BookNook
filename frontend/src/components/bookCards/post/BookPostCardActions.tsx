import {
  CardActions,
  IconButton,
  Rating,
  Typography,
  Stack,
} from "@mui/material";
import type { BookPost } from "@models/Book";
import { useNavigate } from "react-router-dom";
import { FaRegComment } from "react-icons/fa6";
import { FiHeart } from "react-icons/fi";

interface BookPostCardProps {
  post: BookPost;
}

const BookPostCardActions = ({ post }: BookPostCardProps) => {
  const navigate = useNavigate();

  const handleCommentClick = () => navigate(`/posts/${post.id}#comments`);

  return (
    <CardActions
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: "1rem",
      }}
    >
      <Stack direction="row" spacing="1rem" alignItems="center">
        <Stack direction="row" spacing="0.3rem" alignItems="center">
          <IconButton size="small">
            <FiHeart />
          </IconButton>
          <Typography fontSize="1rem">{post.likes.length}</Typography>
        </Stack>

        <Stack direction="row" spacing="0.3rem" alignItems="center">
          <IconButton size="small" onClick={handleCommentClick}>
            <FaRegComment />
          </IconButton>
          <Typography fontSize="1rem">{post.comments.length}</Typography>
        </Stack>
      </Stack>

      <Rating size="small" value={post.rating} precision={0.5} readOnly />
    </CardActions>
  );
};

export default BookPostCardActions;
