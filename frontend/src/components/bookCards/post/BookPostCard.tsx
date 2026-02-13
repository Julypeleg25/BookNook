import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Chip,
  IconButton,
  Rating,
  Typography,
  Stack,
  Box,
  Avatar,
  Link as MuiLink,
} from "@mui/material";
import type { BookPost } from "../../../models/Book";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { FaRegComment } from "react-icons/fa6";
import { FiHeart } from "react-icons/fi";
import BookPostCardActions from "./BookPostCardActions";
import BookPostCardHeader from "./BookPostCardHeader";

interface BookPostCardProps {
  post: BookPost;
}

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
          {post.description.slice(0, 90)}…
        </Typography>
      </CardContent>

      <BookPostCardActions post={post} />

      <Box px="1rem" pb="1rem">
        <Stack direction="row" spacing="0.4rem" flexWrap="wrap">
          {post.book.genres.map((genre) => (
            <Chip key={genre} label={genre} size="small" />
          ))}
        </Stack>
      </Box>
    </Card>
  );
};

export default BookPostCard;
