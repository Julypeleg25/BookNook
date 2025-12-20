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
import { red } from "@mui/material/colors";
import { BiShare } from "react-icons/bi";
import { CgMoreVertical } from "react-icons/cg";
import { GrFavorite } from "react-icons/gr";
import type { BookPost } from "../models/Book";

interface BookPostCardProps {
  book: BookPost;
}

const BookPostCard = ({ book }: BookPostCardProps) => {
  return (
    <Card sx={{ width: "22rem" }}>
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
          {book.description}
        </Typography>
      </CardContent>
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
          <Chip label={book.book.genre}></Chip>
        <Rating value={book.rating} precision={0.5} readOnly />
      </CardActions>
    </Card>
  );
};

export default BookPostCard;
