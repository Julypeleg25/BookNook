import { CircularProgress, IconButton, Stack, Typography } from "@mui/material";
import type React from "react";
import { FaHeart, FaRegComment } from "react-icons/fa6";
import { FiHeart } from "react-icons/fi";

interface BookPostCardFooterProps {
  commentsCount: number;
  isAuthor?: boolean;
  isLiked: boolean;
  isUpdatingLike: boolean;
  likesCount: number;
  onCommentsClick: (event: React.MouseEvent) => void;
  onLikeClick: (event: React.MouseEvent) => void;
}

const BookPostCardFooter = ({
  commentsCount,
  isAuthor,
  isLiked,
  isUpdatingLike,
  likesCount,
  onCommentsClick,
  onLikeClick,
}: BookPostCardFooterProps) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    sx={{
      px: 2.5,
      py: 1.5,
      borderTop: "1px solid",
      borderColor: "divider",
      bgcolor: "background.default",
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Stack direction="row" spacing={0.5} alignItems="center">
        <IconButton
          size="small"
          onClick={onLikeClick}
          disabled={Boolean(isAuthor) || isUpdatingLike}
          sx={{
            color: isLiked ? "error.main" : "text.secondary",
            p: 0.5,
            transition: "all 0.2s ease",
            "&:hover": { bgcolor: "rgba(211, 47, 47, 0.08)", transform: "scale(1.1)" },
          }}
        >
          {isUpdatingLike ? (
            <CircularProgress size={18} color="inherit" />
          ) : isLiked ? (
            <FaHeart size={18} />
          ) : (
            <FiHeart size={18} />
          )}
        </IconButton>
        <Typography variant="body2" fontWeight={800} color={isLiked ? "error.main" : "text.primary"}>
          {likesCount}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={0.5} alignItems="center">
        <IconButton
          size="small"
          onClick={onCommentsClick}
          sx={{
            color: "text.secondary",
            p: 0.5,
            "&:hover": { bgcolor: "rgba(0,0,0,0.04)", transform: "scale(1.1)" },
          }}
        >
          <FaRegComment size={18} />
        </IconButton>
        <Typography variant="body2" fontWeight={800}>
          {commentsCount}
        </Typography>
      </Stack>
    </Stack>
  </Stack>
);

export default BookPostCardFooter;
