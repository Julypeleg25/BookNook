import {
  Box,
  Typography,
  Tooltip,
  Rating,
  Stack,
  Link as MuiLink,
} from "@mui/material";
import type { BookPost } from "@models/Book";
import { formatDate } from "@utils/dateUtils";
import { Link as RouterLink } from "react-router-dom";
import { RATING_STEP } from "@shared/constants/validation";
import { resolveMediaUrl } from "@/utils/mediaUtils";
import PostActionsMenu, { PostActionsMenuOverlay } from "./post/PostActionsMenu";

interface MyBookPostCardProps {
  post: BookPost;
}

const MyBookPostCard = ({ post }: MyBookPostCardProps) => (
  <Stack alignItems="center" spacing="0.6rem">
    <Box
      sx={{
        width: "15rem",
        height: "18rem",
        borderRadius: "0.5rem",
        boxShadow: 1,
        overflow: "hidden",
        userSelect: "none",
        position: "relative",
      }}
    >
      <Box
        component="img"
        src={resolveMediaUrl(post.imageUrl)}
        alt={post.book.title}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          bgcolor: "grey.50",
          pointerEvents: "none",
        }}
        draggable={false}
      />
      <PostActionsMenuOverlay>
        <PostActionsMenu post={post} />
      </PostActionsMenuOverlay>
    </Box>
    <Tooltip title="view book's details" arrow>
      <MuiLink
        component={RouterLink}
        to={`/books/${post.book.id}`}
        underline="none"
        color="inherit"
        sx={{
          transition: "color 0.2s ease",
          "&:hover": {
            color: "primary.main",
          },
        }}
      >
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 600,
            transition: "text-decoration 0.2s ease",
          }}
        >
          {post.book.title}
        </Typography>
      </MuiLink>
    </Tooltip>

    <Typography fontSize="0.85rem" color="text.secondary">
      {formatDate(post.createdDate)}
    </Typography>

    <Rating size="small" value={post.rating} precision={RATING_STEP} readOnly />
  </Stack>
);

export default MyBookPostCard;
