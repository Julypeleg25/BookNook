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
} from "@mui/material";
import { CgMoreVertical } from "react-icons/cg";
import { GrFavorite } from "react-icons/gr";
import type { BookPost } from "../models/Book";
import { MdComment } from "react-icons/md";
import { Link } from "react-router-dom";

interface BookPostCardProps {
  book: BookPost;
}

const BookPostCard = ({ book }: BookPostCardProps) => {
  return (
    <Card
      sx={{
        width: "22rem",
        cursor: "pointer",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        boxShadow: 1,
        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-2px)",
        },
      }}
    >
      <Link to={`/booksPosts/${book.id}`} style={{ textDecoration: "none" }}>
        <CardHeader
          avatar={
            <Avatar>
              <img src={book.user.avatarUrl} alt={book.user.name} />
            </Avatar>
          }
          action={
            <IconButton aria-label="settings">
              <CgMoreVertical />
            </IconButton>
          }
          title={book.book.title}
          subheader={book.createdDate.toDateString()}
        />
        <CardMedia component="img" height="260rem" image={book.imageUrl} />
        <CardContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {book.description.substring(0,45)}...
          </Typography>
        </CardContent>
      </Link>
      <CardActions
        style={{
          justifyContent: "space-between",
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div>
          <IconButton>
            <GrFavorite />
          </IconButton>
          {book.likes}
        </div>
        <div>
          <IconButton>
            <MdComment />
          </IconButton>
          {book.comments.length}
        </div>
        <Chip label={book.book.genre}></Chip>
        <Rating value={book.rating} precision={0.5} readOnly />
      </CardActions>
    </Card>
  );
};

export default BookPostCard;
