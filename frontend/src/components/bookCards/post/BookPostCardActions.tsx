import {
  CardActions,
  IconButton,
  Rating,
  Typography,
  Stack,
} from "@mui/material";
import type { BookPost } from "@models/Book";
import { useState } from "react";
import { FaRegComment, FaHeart } from "react-icons/fa6";
import { FiHeart } from "react-icons/fi";
import useUserStore from "@/state/useUserStore";
import { userReviewService } from "@/api/services/userReviewService";
import { useSnackbar } from "notistack";

interface BookPostCardProps {
  post: BookPost;
  onCommentsClick?: (e: React.MouseEvent) => void;
}

const BookPostCardActions = ({ post, onCommentsClick }: BookPostCardProps) => {
  const { user, isAuthenticated } = useUserStore();
  const [likes, setLikes] = useState<string[]>(post.likes);
  const isLiked = user?.id ? likes.includes(user.id) : false;
  const { enqueueSnackbar } = useSnackbar();

  // Ensure we compare strings safely
  const isAuthor = user?.id && post.user ? user.id === (post.user as any).id || user.id === (post.user as any)._id : false;

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (!isAuthenticated) {
      enqueueSnackbar("Please login to like posts", { variant: "info" });
      return;
    }

    if (isAuthor) {
      enqueueSnackbar("You cannot like your own post", { variant: "warning" });
      return;
    }

    const previousLikes = [...likes];
    const newLikes = isLiked
      ? likes.filter(id => id !== user.id)
      : [...likes, user.id];

    setLikes(newLikes); // Optimistic update

    try {
      if (isLiked) {
        await userReviewService.unlikeReview(post.id);
      } else {
        await userReviewService.likeReview(post.id);
      }
    } catch (error) {
      setLikes(previousLikes); // Rollback
      enqueueSnackbar("Error updating like", { variant: "error" });
    }
  };

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
          <IconButton
            size="small"
            onClick={handleLikeClick}
            disabled={isAuthor}
            sx={{ color: isLiked ? 'red' : 'inherit' }}
          >
            {isLiked ? <FaHeart /> : <FiHeart />}
          </IconButton>
          <Typography fontSize="1rem">{likes.length}</Typography>
        </Stack>

        <Stack direction="row" spacing="0.3rem" alignItems="center">
          <IconButton size="small" onClick={onCommentsClick}>
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
