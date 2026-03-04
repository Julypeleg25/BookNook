import {
  CardActions,
  IconButton,
  Rating,
  Typography,
  Stack,
} from "@mui/material";
import type { BookPost } from "@models/Book";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FaRegComment, FaHeart } from "react-icons/fa6";
import { FiHeart } from "react-icons/fi";
import { userReviewService } from "@/api/services/userReviewService";
import { enqueueSnackbar } from "notistack";
import useUserStore from "@/state/useUserStore";

interface BookPostCardProps {
  post: BookPost;
  onCommentsClick?: (e: React.MouseEvent) => void;
}

const BookPostCardActions = ({ post, onCommentsClick }: BookPostCardProps) => {
  const { user } = useUserStore();
  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const queryClient = useQueryClient();
  const isLiked = user ? likes.includes(user.id || (user as any)._id) : false;
  const isAuthor = user?.username === post.user.username;

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      enqueueSnackbar("Please login to like posts", { variant: "info" });
      return;
    }

    try {
      if (isLiked) {
        await userReviewService.unlikeReview(post.id);
        setLikes((prev) => prev.filter((id) => id !== (user.id || (user as any)._id)));
      } else {
        await userReviewService.likeReview(post.id);
        setLikes((prev) => [...prev, user.id || (user as any)._id]);
      }
      queryClient.invalidateQueries({ queryKey: ["allReviews"] });
    } catch (error: any) {
      enqueueSnackbar(error.message || "Failed to update like", { variant: "error" });
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
            onClick={handleLikeToggle}
            disabled={isAuthor}
            sx={{ color: isLiked ? "red" : "inherit" }}
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
