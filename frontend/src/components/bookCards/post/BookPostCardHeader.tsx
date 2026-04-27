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
              transition: "text-decoration 0.2s ease",
            }}
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
        sx={{ textDecoration: "none", position: "relative", display: "block" }}
      >
        {isImageLoading && (
          <Skeleton variant="rectangular" height="16rem" width="100%" />
        )}
        {imgSrc && (
          <CardMedia
            component="img"
            image={imgSrc}
            onError={handleImageError}
            onLoad={handleImageLoad}
            sx={{
              height: "16rem",
              objectFit: "cover",
              display: isImageLoading ? "none" : "block"
            }}
          />
        )}
      </Box>
    </>
  );
};

export default BookPostCardHeader;
