import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Typography,
  Stack,
  Box,
} from "@mui/material";
import type { BookPost } from "@models/Book";
import BookPostCardActions from "./BookPostCardActions";
import BookPostCardHeader from "./BookPostCardHeader";
import { useNavigate } from "react-router-dom";
import FullPostActions from "../FullPostActions";

interface BookPostCardProps {
  post: BookPost;
}

const MAX_DESCRIPTION_LENGTH = 90;

const BookPostCard = ({ post }: BookPostCardProps) => {
  const navigate = useNavigate();

  const handleCommentsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/posts/${post.id}#comments`);
  };

  const handleCardClick = () => {
    navigate(`/posts/${post.id}`);
  };

  return (
    <Card
      sx={{
        width: "100%",
        maxWidth: "25rem",
        borderRadius: "1rem",
        boxShadow: 1,
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-0.15rem)",
        },
      }}
    >
      <CardActionArea
        onClick={handleCardClick}
        sx={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <BookPostCardHeader post={post} />

        <CardContent>
          <Typography color="text.secondary">
            {post.description.slice(0, MAX_DESCRIPTION_LENGTH)}
            {post.description.length > MAX_DESCRIPTION_LENGTH ? "…" : ""}
          </Typography>
        </CardContent>
      </CardActionArea>

      <BookPostCardActions post={post} onCommentsClick={handleCommentsClick} />

      <Box
        px="1rem"
        pb="1rem"
        onClick={handleCardClick}
        sx={{ cursor: "pointer" }}
      >
        <Stack direction="row" spacing="0.4rem" flexWrap="wrap">
          {(post.book?.genres ?? []).map((genre) => (
            <Chip key={genre} label={genre} size="small" />
          ))}
        </Stack>
      </Box>
    </Card>
  );
};

export default BookPostCard;
