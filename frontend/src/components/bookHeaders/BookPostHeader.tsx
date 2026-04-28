import { IconButton, Rating, Tooltip, Typography, Stack } from "@mui/material";
import { FaCalendar, FaUser, FaHeart } from "react-icons/fa6";
import { FiHeart } from "react-icons/fi";
import { formatDate } from "@utils/dateUtils";
import type { BookPost } from "@models/Book";
import BookHeader from "./BookHeaderButtons";
import { RATING_STEP } from "@shared/constants/validation";
import { useReviewLikeToggle } from "@/hooks/useReviewLikeToggle";

interface BookPostHeaderProps {
  bookPost: BookPost;
}

const BookPostHeader = ({ bookPost }: BookPostHeaderProps) => {
  const { likes, isLiked, isAuthor, isUpdatingLike, toggleLike } =
    useReviewLikeToggle({
      reviewId: bookPost.id,
      reviewUserId: bookPost.user?.id,
      initialLikes: bookPost.likes,
    });

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
          <Stack direction="row" spacing={1} alignItems="center">
            <Rating
              size="large"
              value={bookPost.rating}
              precision={RATING_STEP}
              readOnly
            />
            <Typography variant="body2" color="text.secondary">
              {bookPost.rating.toFixed(1)}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip title={isAuthor ? "You cannot like your own post" : isLiked ? "Unlike" : "Like"}>
              <span>
                <IconButton
                  onClick={toggleLike}
                  disabled={Boolean(isAuthor) || isUpdatingLike}
                  sx={{ color: isLiked ? "error.main" : "inherit" }}
                >
                  {isLiked ? <FaHeart size={18} /> : <FiHeart size={18} />}
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
      <BookHeader book={bookPost.book} isBookPost={true} />
    </div>
  );
};

export default BookPostHeader;
