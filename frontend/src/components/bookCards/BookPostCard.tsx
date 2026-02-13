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
} from "@mui/material";
import { CgMoreVertical } from "react-icons/cg";
import { GrFavorite } from "react-icons/gr";
import { MdComment } from "react-icons/md";
import type { BookPost } from "../../models/Book";
import { Link as RouterLink } from "react-router-dom";

interface BookPostCardProps {
  book: BookPost;
}

const BookPostCard = ({ book }: BookPostCardProps) => {
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
        avatar={
          <Avatar
            src={book.user.avatarUrl}
            alt={book.user.name}
          />
        }
        action={
          <IconButton>
            <CgMoreVertical />
          </IconButton>
        }
        title={
          <Typography
            component={RouterLink}
            to={`/booksPosts/${book.id}`}
            sx={{
              fontWeight: 600,
              color: "text.primary",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            {book.book.title}
          </Typography>
        }
        subheader={book.createdDate.toDateString()}
      />

      <Box
        component={RouterLink}
        to={`/booksPosts/${book.id}`}
        sx={{ textDecoration: "none" }}
      >
        <CardMedia
          component="img"
          image={book.imageUrl}
          sx={{
            height: "16rem",
            objectFit: "cover",
          }}
        />
      </Box>

      <CardContent>
        <Typography color="text.secondary">
          {book.description.slice(0, 90)}…
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
              <GrFavorite />
            </IconButton>
            <Typography fontSize="0.85rem">
              {book.likes}
            </Typography>
          </Stack>

          <Stack direction="row" spacing="0.3rem" alignItems="center">
            <IconButton size="small">
              <MdComment />
            </IconButton>
            <Typography fontSize="0.85rem">
              {book.comments.length}
            </Typography>
          </Stack>
        </Stack>
        <Rating
          size="small"
          value={book.rating}
          precision={0.5}
          readOnly
        />
      </CardActions>

      <Box px="1rem" pb="1rem">
        <Stack direction="row" spacing="0.4rem" flexWrap="wrap">
          {book.book.genres.map((genre) => (
            <Chip
              key={genre}
              label={genre}
              size="small"
            />
          ))}
        </Stack>
      </Box>
    </Card>
  );
};

export default BookPostCard;
