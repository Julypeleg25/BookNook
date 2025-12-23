import {
  Avatar,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Chip,
  IconButton,
  Typography,
} from "@mui/material";
import { CgMoreVertical } from "react-icons/cg";
import type { Book } from "../models/Book";
import { Link } from "react-router-dom";

interface BookInfoCardProps {
  book: Book;
}

const BookInfoCard = ({ book }: BookInfoCardProps) => {
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
      <Link to={`/books/${book.id}`} style={{ textDecoration: "none" }}>
        <CardHeader
          avatar={
            <Avatar>
              <img src={book.coverImage} alt={book.title} />
            </Avatar>
          }
          action={
            <IconButton aria-label="settings">
              <CgMoreVertical />
            </IconButton>
          }
          title={book.title}
          subheader={book.publishedDate.toDateString()}
        />
        <CardMedia component="img" height="260rem" image={book.coverImage} />
        <CardContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {book.description.substring(0, 45)}...
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
        <Chip label={book.genre}></Chip>
      </CardActions>
    </Card>
  );
};

export default BookInfoCard;
