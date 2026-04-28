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
        maxWidth: "26rem",
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 22px 48px -12px rgba(31, 41, 51, 0.15)",
          transform: "translateY(-6px)",
          "& .card-image": {
            transform: "scale(1.06)",
          },
          "& .read-more-btn": {
            color: "primary.main",
            gap: "6px",
          },
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          aspectRatio: "16 / 10",
          bgcolor: "grey.100",
          overflow: "hidden",
        }}
      >
        {imgSrc && (
          <Box
            className="card-image"
            component="img"
            src={imgSrc}
            alt={post.book.title}
            onError={() => setImgSrc(post.book.thumbnail)}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 0.5s ease",
            }}
          />
        )}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)",
          }}
        />

        {/* Action Menu - Internalized Glass Style */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 2,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <PostActionsMenu post={post} variant="glass" />
        </Box>

        <Stack
          spacing={1}
          sx={{
            position: "absolute",
            left: 20,
            right: 20,
            bottom: 18,
            color: "#fff",
            zIndex: 1,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={800}
            lineHeight={1.2}
            title={post.book.title}
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            {post.book.title}
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Rating 
              value={post.rating} 
              precision={RATING_STEP} 
              readOnly 
              size="small" 
              sx={{ 
                "& .MuiRating-iconFilled": { color: "#ffb400" },
                "& .MuiRating-iconEmpty": { color: "rgba(255,255,255,0.4)" }
              }} 
            />
            <Typography variant="body2" fontWeight={700} sx={{ opacity: 0.95 }}>
              {post.rating.toFixed(1)}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Stack spacing={2} sx={{ p: 2.5, flex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1.5}>
          <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
            <Avatar
              src={getAvatarSrcUrl(post.user.avatar)}
              alt={post.user.username}
              sx={{ 
                width: 40, 
                height: 40,
                border: "2px solid",
                borderColor: "primary.light",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
              }}
            />
            <Box minWidth={0}>
              <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ lineHeight: 1.2 }}>
                @{post.user.username}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {formatDate(post.createdDate)}
              </Typography>
            </Box>
          </Stack>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.8,
            minHeight: "5.4rem",
            overflowWrap: "anywhere",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {preview}
        </Typography>

        {genres.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {genres.slice(0, 3).map((genre) => (
              <Chip
                key={genre}
                label={genre}
                size="small"
                variant="outlined"
                title={genre}
                sx={{ 
                  maxWidth: "9.5rem", 
                  height: "22px",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  bgcolor: "rgba(0,0,0,0.02)",
                  borderColor: "divider"
                }}
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
              onClick={handleLike}
              disabled={Boolean(isAuthor) || isUpdatingLike}
              sx={{ 
                color: isLiked ? "error.main" : "text.secondary",
                p: 0.5,
                transition: "all 0.2s ease",
                "&:hover": { bgcolor: "rgba(211, 47, 47, 0.08)", transform: "scale(1.1)" }
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
              {likes.length}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <IconButton 
              size="small" 
              onClick={openComments} 
              sx={{ 
                color: "text.secondary",
                p: 0.5,
                "&:hover": { bgcolor: "rgba(0,0,0,0.04)", transform: "scale(1.1)" }
              }}
            >
              <FaRegComment size={18} />
            </IconButton>
            <Typography variant="body2" fontWeight={800}>
              {post.comments.length}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

export default BookPostCard;
