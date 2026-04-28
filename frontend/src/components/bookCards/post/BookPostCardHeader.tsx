import { CardHeader, CardMedia, Typography, Box, Avatar, Skeleton } from "@mui/material";
import type { BookPost } from "@models/Book";
import { Link as RouterLink } from "react-router-dom";
import { getAvatarSrcUrl } from "@/utils/userUtils";
import { formatDate } from "@/utils/dateUtils";
import env from "@/config/env";
import { useState } from "react";
import PostActionsMenu from "./PostActionsMenu";

interface BookPostCardProps {
  post: BookPost;
}

const BookPostCardHeader = ({ post }: BookPostCardProps) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(() => {
    if (!post.imageUrl) return post.book.thumbnail;
    if (post.imageUrl.startsWith("http")) return post.imageUrl;
    return `${env.API_BASE_URL}${post.imageUrl}`;
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
        action={<PostActionsMenu post={post} />}
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
          backgroundColor: "grey.100",
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
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: isImageLoading ? "none" : "block",
            }}
          />
        )}
      </Box>
    </>
  );
};

export default BookPostCardHeader;
