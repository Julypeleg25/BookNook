import {
  Avatar,
  Box,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import type { BookPost } from "@models/Book";
import { useEffect, useMemo, useState } from "react";
import { FaHeart, FaRegComment } from "react-icons/fa6";
import { FiHeart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import env from "@/config/env";
import { RATING_STEP } from "@shared/constants/validation";
import { formatDate } from "@/utils/dateUtils";
import { getAvatarSrcUrl } from "@/utils/userUtils";
import { useReviewLikeToggle } from "@/hooks/useReviewLikeToggle";
import PostActionsMenu from "./PostActionsMenu";

interface BookPostCardProps {
  post: BookPost;
}

const DESCRIPTION_PREVIEW_LENGTH = 150;

const BookPostCard = ({ post }: BookPostCardProps) => {
  const navigate = useNavigate();
  const imageUrl = useMemo(() => {
    if (!post.imageUrl) return post.book.thumbnail;
    return post.imageUrl.startsWith("http")
      ? post.imageUrl
      : `${env.API_BASE_URL}${post.imageUrl}`;
  }, [post.book.thumbnail, post.imageUrl]);
  const [imgSrc, setImgSrc] = useState<string | undefined>(imageUrl);

  useEffect(() => {
    setImgSrc(imageUrl);
  }, [imageUrl]);

  const { likes, isLiked, isAuthor, isUpdatingLike, toggleLike } =
    useReviewLikeToggle({
      reviewId: post.id,
      reviewUserId: post.user?.id,
      initialLikes: post.likes,
    });

  const genres = (post.book?.genres?.length ?? 0) > 0
    ? post.book?.genres ?? []
    : post.book?.categories ?? [];
  const preview =
    post.description.length > DESCRIPTION_PREVIEW_LENGTH
      ? `${post.description.slice(0, DESCRIPTION_PREVIEW_LENGTH)}...`
      : post.description;

  const openPost = () => {
    navigate(`/posts/${post.id}`);
  };

  const openComments = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/posts/${post.id}#comments`);
  };

  const handleLike = (event: React.MouseEvent) => {
    event.stopPropagation();
    toggleLike();
  };

  return (
    <Card
      onClick={openPost}
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: "25rem",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": {
          borderColor: "primary.light",
          boxShadow: "0 18px 42px rgba(31, 41, 51, 0.12)",
          transform: "translateY(-0.18rem)",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          aspectRatio: "16 / 11",
          bgcolor: "grey.100",
          overflow: "hidden",
        }}
      >
        {imgSrc && (
          <Box
            component="img"
            src={imgSrc}
            alt={post.book.title}
            onError={() => setImgSrc(post.book.thumbnail)}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        )}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(31,41,51,0.02) 35%, rgba(31,41,51,0.72) 100%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            borderRadius: "999px",
            bgcolor: "rgba(255,255,255,0.92)",
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <PostActionsMenu post={post} />
        </Box>
        <Stack
          spacing={0.5}
          sx={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 14,
            color: "#fff",
          }}
        >
          <Typography
            fontWeight={800}
            title={post.book.title}
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textShadow: "0 1px 10px rgba(0,0,0,0.35)",
            }}
          >
            {post.book.title}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Rating value={post.rating} precision={RATING_STEP} readOnly size="small" />
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {post.rating.toFixed(1)}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Stack spacing={2} sx={{ p: 2, flex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1.5}>
          <Stack direction="row" spacing={1.25} alignItems="center" minWidth={0}>
            <Avatar
              src={getAvatarSrcUrl(post.user.avatar)}
              alt={post.user.username}
              sx={{ width: 38, height: 38 }}
            />
            <Box minWidth={0}>
              <Typography fontWeight={700} noWrap>
                @{post.user.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(post.createdDate)}
              </Typography>
            </Box>
          </Stack>
        </Stack>

        <Typography
          color="text.secondary"
          sx={{
            lineHeight: 1.7,
            minHeight: "4.8rem",
            overflowWrap: "anywhere",
          }}
        >
          {preview}
        </Typography>

        {genres.length > 0 && (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {genres.slice(0, 3).map((genre) => (
              <Chip
                key={genre}
                label={genre}
                size="small"
                variant="outlined"
                title={genre}
                sx={{ maxWidth: "9rem" }}
              />
            ))}
          </Stack>
        )}
      </Stack>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          px: 1.5,
          py: 1,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "rgba(91, 111, 106, 0.035)",
        }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center">
          <IconButton
            size="small"
            onClick={handleLike}
            disabled={Boolean(isAuthor) || isUpdatingLike}
            sx={{ color: isLiked ? "error.main" : "text.secondary" }}
          >
            {isUpdatingLike ? (
              <CircularProgress size={18} color="inherit" />
            ) : isLiked ? (
              <FaHeart size={18} />
            ) : (
              <FiHeart size={18} />
            )}
          </IconButton>
          <Typography variant="body2" fontWeight={700}>
            {likes.length}
          </Typography>
          <IconButton size="small" onClick={openComments} sx={{ color: "text.secondary" }}>
            <FaRegComment size={18} />
          </IconButton>
          <Typography variant="body2" fontWeight={700}>
            {post.comments.length}
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          Read post
        </Typography>
      </Stack>
    </Card>
  );
};

export default BookPostCard;
