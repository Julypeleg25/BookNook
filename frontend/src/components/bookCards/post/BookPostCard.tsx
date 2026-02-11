import { Card, CardContent, Chip, Typography, Stack, Box } from "@mui/material";
import type { BookPost } from "@models/Book";
import BookPostCardActions from "./BookPostCardActions";
import BookPostCardHeader from "./BookPostCardHeader";

interface BookPostCardProps {
  post: BookPost;
}

const MAX_DESCRIPTION_LENGTH = 90;

const BookPostCard = ({ post }: BookPostCardProps) => {
  return (
    <Card
      sx={{
        width: "22rem",
        borderRadius: "1rem",
        boxShadow: 1,
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-0.15rem)",
        },
      }}
    >
      <BookPostCardHeader post={post} />

      <CardContent>
        <Typography color="text.secondary">
          {post.description.slice(0, MAX_DESCRIPTION_LENGTH)}…
        </Typography>
      </CardContent>

      <BookPostCardActions post={post} />

      <Box px="1rem" pb="1rem">
        <Stack direction="row" spacing="0.4rem" flexWrap="wrap">
          {(post.book.genres ?? []).map((genre) => (
            <Chip key={genre} label={genre} size="small" />
          ))}
        </Stack>
      </Box>
    </Card>
  );
};

export default BookPostCard;
