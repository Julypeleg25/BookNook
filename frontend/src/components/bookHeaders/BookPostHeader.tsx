import { Box, IconButton, Rating, Tooltip, Typography, Stack } from "@mui/material";
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
    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} gap={2} width="100%">
      <Stack spacing={2} minWidth={0} flex={1}>
        <Typography
          variant="h4"
          sx={{ display: "flex", alignItems: "baseline", gap: 1, minWidth: 0, fontWeight: 800 }}
        >
          <Box component="span" sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {bookPost.book.title}
          </Box>
          <Box component="span" sx={{ color: "text.secondary", fontSize: "1.5rem", flexShrink: 0 }}>
            {bookPost.book.publishedDate ? `(${new Date(bookPost.book.publishedDate).getFullYear()})` : ""}
          </Box>
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Rating
              size="medium"
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

        <Typography variant="h5" component="div" sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            <FaCalendar style={{ fontSize: '1.2rem' }} />
            {formatDate(bookPost.createdDate)}
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            <FaUser style={{ fontSize: '1.2rem' }} />
            {bookPost.user.username}
          </Box>
        </Typography>
      </Stack>
      <BookHeader book={bookPost.book} isBookPost={true} />
    </Stack>
  );
};

export default BookPostHeader;
