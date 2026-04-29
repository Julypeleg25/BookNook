import {
  Card,
} from "@mui/material";
import type { BookPost } from "@models/Book";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { resolveMediaUrl } from "@/utils/mediaUtils";
import { useReviewLikeToggle } from "@/hooks/useReviewLikeToggle";
import BookPostCardBody from "./BookPostCardBody";
import BookPostCardFooter from "./BookPostCardFooter";
import BookPostCardImage from "./BookPostCardImage";

interface BookPostCardProps {
  post: BookPost;
}

const DESCRIPTION_PREVIEW_LENGTH = 150;

const BookPostCard = ({ post }: BookPostCardProps) => {
  const navigate = useNavigate();
  const imageUrl = useMemo(() => {
    if (!post.imageUrl) return post.book.thumbnail;
    return resolveMediaUrl(post.imageUrl);
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
        borderRadius: 2,
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
          "& .read-more-btn": {
            color: "primary.main",
            gap: "6px",
          },
        },
      }}
    >
      <BookPostCardImage
        imgSrc={imgSrc}
        post={post}
        onImageError={() => setImgSrc(post.book.thumbnail)}
      />

      <BookPostCardBody genres={genres} post={post} preview={preview} />

      <BookPostCardFooter
        commentsCount={post.comments.length}
        isAuthor={isAuthor}
        isLiked={isLiked}
        isUpdatingLike={isUpdatingLike}
        likesCount={likes.length}
        onCommentsClick={openComments}
        onLikeClick={handleLike}
      />
    </Card>
  );
};

export default BookPostCard;
