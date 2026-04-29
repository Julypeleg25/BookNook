import { CardHeader, CardMedia, Typography, Box, Avatar, Skeleton } from "@mui/material";
import type { BookPost } from "@models/Book";
import { Link as RouterLink } from "react-router-dom";
import { getAvatarSrcUrl } from "@/utils/userUtils";
import { formatDate } from "@/utils/dateUtils";
import { resolveMediaUrl } from "@/utils/mediaUtils";
import { useState } from "react";
import PostActionsMenu, { PostActionsMenuOverlay } from "./PostActionsMenu";
import { POST_CARD_IMAGE_BACKGROUND, POST_CARD_IMAGE_SX } from "./postImageStyles";

interface BookPostCardProps {
  post: BookPost;
}

const BookPostCardHeader = ({ post }: BookPostCardProps) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(() => {
    if (!post.imageUrl) return post.book.thumbnail;
    return resolveMediaUrl(post.imageUrl);
  });
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleImageError = () => {
    setIsImageLoading(false);
    if (imgSrc !== post.book.thumbnail) {
      setImgSrc(post.book.thumbnail);
    }
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  return (
    <>
      <CardHeader
        avatar={
          <Avatar
            src={getAvatarSrcUrl(post.user.avatar)}
            alt={post.user.username}
          />
        }
        title={
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              transition: "text-decoration 0.2s ease",
            }}
            title={post.book?.title || "Book Unavailable"}
          >
            {post.book?.title || "Book Unavailable"}
          </Typography>
        }
        subheader={
          <Box gap={"0.3rem"} display={"grid"}>
            <div>@{post.user.username}</div>
            {formatDate(post.createdDate)}
          </Box>
        }
      />

      <Box
        component={RouterLink}
        to={`/posts/${post.id}`}
        sx={{
          textDecoration: "none",
          position: "relative",
          display: "block",
          width: "100%",
          aspectRatio: "4 / 3",
          backgroundColor: POST_CARD_IMAGE_BACKGROUND,
          overflow: "hidden",
        }}
      >
        {isImageLoading && (
          <Skeleton variant="rectangular" width="100%" height="100%" />
        )}
        {imgSrc && (
          <CardMedia
            component="img"
            image={imgSrc}
            onError={handleImageError}
            onLoad={handleImageLoad}
            sx={{
              ...POST_CARD_IMAGE_SX,
              display: isImageLoading ? "none" : "block",
            }}
          />
        )}
        <PostActionsMenuOverlay>
          <PostActionsMenu post={post} />
        </PostActionsMenuOverlay>
      </Box>
    </>
  );
};

export default BookPostCardHeader;
