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
import { userReviewService } from "@/api/services/userReviewService";
import { useSnackbar } from "notistack";
import { usePostActions } from "@/hooks/usePostActions";

interface BookPostCardProps {
  post: BookPost;
  onCommentsClick?: (e: React.MouseEvent) => void;
}

const BookPostCardActions = ({ post, onCommentsClick }: BookPostCardProps) => {
  const { 
    likes, 
    isLiked, 
    isAuthor, 
    handleLikeToggle 
  } = usePostActions(post);

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
