import {
  Avatar,
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
  Link as MuiLink,
} from "@mui/material";
import type { BookPost } from "../../models/Book";
import { Link as RouterLink } from "react-router-dom";
import { FaRegComment } from "react-icons/fa6";
import { FiHeart } from "react-icons/fi";

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
      <CardHeader
        avatar={<Avatar src={post.user.avatarUrl} alt={post.user.name} />}
        title={
          <MuiLink
            component={RouterLink}
            to={`/books/${post.book.id}`}
            underline="none"
            color="primary.main"
            sx={{
              transition: "color 0.2s ease",
              "&:hover": {
                color: "primary.light",
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
        }
        subheader={post.createdDate.toDateString()}
      />

      <Box
        component={RouterLink}
        to={`/posts/${post.id}`}
        sx={{ textDecoration: "none" }}
      >
        <CardMedia
          component="img"
          image={post.imageUrl}
          sx={{
            height: "16rem",
            objectFit: "cover",
          }}
        />
      </Box>

      <CardContent>
        <Typography color="text.secondary">
          {post.description.slice(0, 90)}…
        </Typography>
      </CardContent>

      <CardActions
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingX: "1rem",
        }}
      >
        <Stack direction="row" spacing="1rem" alignItems="center">
          <Stack direction="row" spacing="0.3rem" alignItems="center">
            <IconButton size="small">
              <FiHeart />
            </IconButton>
            <Typography fontSize="1rem">{post.likes}</Typography>
          </Stack>

          <Stack direction="row" spacing="0.3rem" alignItems="center">
            <IconButton size="small">
              <FaRegComment />
            </IconButton>
            <Typography fontSize="1rem">{post.comments.length}</Typography>
          </Stack>
        </Stack>
        <Rating size="small" value={post.rating} precision={0.5} readOnly />
      </CardActions>

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
