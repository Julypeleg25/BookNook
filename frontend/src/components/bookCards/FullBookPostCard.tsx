import {
  Box,
  Card,
  CardContent,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import type { BookPost } from "@models/Book";
import { FaRegComment } from "react-icons/fa6";
import { FiHeart } from "react-icons/fi";
import PostActionsMenu from "./post/PostActionsMenu";
import { RATING_STEP } from "@shared/constants/validation";

interface FullBookPostCardProps {
  post: BookPost;
}

const DESCRIPTION_PREVIEW_LENGTH = 260;

const FullBookPostCard = ({ post }: FullBookPostCardProps) => {
  return (
    <Card elevation={2} sx={{ borderRadius: "1.2rem", padding: "1.2rem" }}>
      <CardContent sx={{ padding: 0 }}>
        <Stack direction="row" spacing="1.5rem">
          <Box
            component="img"
            src={post.imageUrl}
            alt={post.book.title}
            sx={{
              width: "11rem",
              aspectRatio: "4 / 5",
              borderRadius: "1rem",
              objectFit: "cover",
            }}
          />

          <Stack spacing="1rem" flex={1} minWidth={0}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Typography
                title={post.book.title}
                sx={{
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {post.book.title}
              </Typography>
              <PostActionsMenu post={post} />
            </Stack>
            <Rating value={post.rating} precision={RATING_STEP} readOnly size="small" />
            <Typography color="text.secondary">
              {post.description.slice(0, DESCRIPTION_PREVIEW_LENGTH)}
              {post.description.length > DESCRIPTION_PREVIEW_LENGTH ? "..." : ""}
            </Typography>

            <Stack direction="row" spacing="1.2rem" alignItems="center">
              <Stack direction="row" gap="0.4rem" alignItems="center">
                <FiHeart /> {post.likes.length}
              </Stack>
              <Stack direction="row" gap="0.4rem" alignItems="center">
                <FaRegComment /> {post.comments.length}
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FullBookPostCard;
