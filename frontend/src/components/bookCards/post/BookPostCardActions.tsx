import {
  CardActions,
  CircularProgress,
  IconButton,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import type { BookPost } from "@models/Book";
import { FaRegComment, FaHeart } from "react-icons/fa6";
import { FiHeart } from "react-icons/fi";
import { RATING_STEP } from "@shared/constants/validation";
import { useReviewLikeToggle } from "@/hooks/useReviewLikeToggle";

interface BookPostCardProps {
  post: BookPost;
  onCommentsClick?: (e: React.MouseEvent) => void;
}

const BookPostCardActions = ({ post, onCommentsClick }: BookPostCardProps) => {
  const { likes, isLiked, isAuthor, isUpdatingLike, toggleLike } =
    useReviewLikeToggle({
      reviewId: post.id,
      reviewUserId: post.user?.id,
      initialLikes: post.likes,
    });

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
            onClick={(event) => {
              event.stopPropagation();
              toggleLike();
            }}
            disabled={Boolean(isAuthor) || isUpdatingLike}
            sx={{ color: isLiked ? "error.main" : "inherit" }}
          >
            {isUpdatingLike ? (
              <CircularProgress size={18} color="inherit" />
            ) : isLiked ? (
              <FaHeart size={18} />
            ) : (
              <FiHeart size={18} />
            )}
          </IconButton>
          <Typography fontSize="1rem">{likes.length}</Typography>
        </Stack>

        <Stack direction="row" spacing="0.3rem" alignItems="center">
          <IconButton size="small" onClick={onCommentsClick} sx={{ p: 0.75 }}>
            <FaRegComment size={18} />
          </IconButton>
          <Typography fontSize="1rem">{post.comments.length}</Typography>
        </Stack>
      </Stack>

      <Rating size="small" value={post.rating} precision={RATING_STEP} readOnly />
    </CardActions>
  );
};

export default BookPostCardActions;
