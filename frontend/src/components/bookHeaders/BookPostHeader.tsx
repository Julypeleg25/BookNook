import { IconButton, Rating, Tooltip, Typography, Stack } from "@mui/material";
import { FaCalendar, FaUser, FaHeart } from "react-icons/fa6";
import { FiHeart } from "react-icons/fi";
import { formatDate } from "@utils/dateUtils";
import type { BookPost } from "@models/Book";
import BookHeader from "./BookHeaderButtons";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useUserStore from "@/state/useUserStore";
import { userReviewService } from "@/api/services/userReviewService";
import { useSnackbar } from "notistack";
import { invalidateReviewCaches } from "@/api/queryCache";

interface BookPostHeaderProps {
  bookPost: BookPost;
}

const BookPostHeader = ({ bookPost }: BookPostHeaderProps) => {
  const { user, isAuthenticated } = useUserStore();
  const [likes, setLikes] = useState<string[]>(bookPost.likes);
  const [isUpdatingLike, setIsUpdatingLike] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const isLiked = user?.id ? likes.includes(user.id) : false;
  const isAuthor = user?.id && bookPost.user ? user.id === bookPost.user.id : false;
  const queryClient = useQueryClient();

  useEffect(() => {
    setLikes(bookPost.likes);
  }, [bookPost.likes]);

  const handleLikeClick = async () => {
    if (isUpdatingLike) return;

    if (!isAuthenticated) {
      enqueueSnackbar("Please login to like posts", { variant: "info" });
      return;
    }

    if (isAuthor) {
      enqueueSnackbar("You cannot like your own post", { variant: "warning" });
      return;
    }

    const previousLikes = [...likes];
    const newLikes = isLiked
      ? likes.filter(id => id !== user.id)
      : [...likes, user.id];

    setLikes(newLikes);

    try {
      setIsUpdatingLike(true);
      if (isLiked) {
        await userReviewService.unlikeReview(bookPost.id);
      } else {
        await userReviewService.likeReview(bookPost.id);
      }
      invalidateReviewCaches(queryClient, { reviewId: bookPost.id });
    } catch {
      setLikes(previousLikes);
      enqueueSnackbar("Error updating like", { variant: "error" });
    } finally {
      setIsUpdatingLike(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%"
      }}
    >
      <div style={{ display: "grid", gap: "1rem" }}>
        <div style={{ gap: "0.5rem", display: "flex", alignItems: "center" }}>

          <Typography variant="h4">{bookPost.book.title}</Typography>
          <Typography variant="h5" color="text.secondary">
            {bookPost.book.publishedDate ? `(${new Date(bookPost.book.publishedDate).getFullYear()})` : ""}
          </Typography>
        </div>

        <Stack direction="row" spacing={3} alignItems="center">
          <Rating size="large" value={bookPost.rating} readOnly />

          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip title={isAuthor ? "You cannot like your own post" : isLiked ? "Unlike" : "Like"}>
              <span>
                <IconButton
                  onClick={handleLikeClick}
                  disabled={Boolean(isAuthor) || isUpdatingLike}
                  sx={{ color: isLiked ? 'red' : 'inherit' }}
                >
                  {isLiked ? <FaHeart /> : <FiHeart />}
                </IconButton>
              </span>
            </Tooltip>
            <Typography variant="h6">{likes.length}</Typography>
          </Stack>
        </Stack>

        <Typography variant="h5" style={{ display: "flex", gap: "2rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <FaCalendar style={{ fontSize: '1.2rem' }} />
            {formatDate(bookPost.createdDate)}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <FaUser style={{ fontSize: '1.2rem' }} />
            {bookPost.user.username}
          </div>
        </Typography>
      </div>
      <BookHeader id={bookPost.book.id} isBookPost={true} />
    </div>
  );
};

export default BookPostHeader;
