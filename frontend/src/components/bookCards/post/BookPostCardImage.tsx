import { Box, Rating, Stack, Typography } from "@mui/material";
import type { BookPost } from "@models/Book";
import { RATING_STEP } from "@shared/constants/validation";
import PostActionsMenu, { PostActionsMenuOverlay } from "./PostActionsMenu";
import { POST_CARD_IMAGE_BACKGROUND, POST_CARD_IMAGE_SX } from "./postImageStyles";

interface BookPostCardImageProps {
  imgSrc?: string;
  post: BookPost;
  onImageError: () => void;
}

const BookPostCardImage = ({ imgSrc, post, onImageError }: BookPostCardImageProps) => (
  <Box
    sx={{
      position: "relative",
      aspectRatio: "16 / 10",
      bgcolor: POST_CARD_IMAGE_BACKGROUND,
      overflow: "hidden",
    }}
  >
    {imgSrc && (
      <Box
        className="card-image"
        component="img"
        src={imgSrc}
        alt={post.book.title}
        onError={onImageError}
        sx={POST_CARD_IMAGE_SX}
      />
    )}
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)",
      }}
    />

    <PostActionsMenuOverlay>
      <PostActionsMenu post={post} />
    </PostActionsMenuOverlay>

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
            "& .MuiRating-iconEmpty": { color: "rgba(255,255,255,0.4)" },
          }}
        />
        <Typography variant="body2" fontWeight={700} sx={{ opacity: 0.95 }}>
          {post.rating.toFixed(1)}
        </Typography>
      </Stack>
    </Stack>
  </Box>
);

export default BookPostCardImage;
