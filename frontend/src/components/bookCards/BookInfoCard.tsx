import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Stack,
  Rating,
} from "@mui/material";
import type { Book } from "../../models/Book";
import { formatDate } from "../../utils/dateUtils";
import { BiBookmark } from "react-icons/bi";
import { Link as RouterLink } from "react-router-dom";
import { LuBookCheck } from "react-icons/lu";
import BookInfoActions from "./BookInfoActions";

interface BookInfoCardProps {
  book: Book;
}

const BookInfoCard = ({ book }: BookInfoCardProps) => {
  return (
    <Stack alignItems="center" spacing="0.6rem">
      
      <Box
        component={RouterLink}
        to={`/books/${book.id}`}
        sx={{
          width: "15rem",
          height: "18rem",
          borderRadius: "1rem",
          overflow: "hidden",
          textDecoration: "none",
          boxShadow: 1,
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
          "&:hover": {
            boxShadow: 6,
            transform: "translateY(-0.2rem)",
          },
        }}
        
      >
        <Box
          component="img"
          src={book.coverImage}
          alt={book.title}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>

      <Stack spacing="0.2rem" width="15rem">
        <Typography
          component={RouterLink}
          to={`/books/${book.id}`}
          sx={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "text.primary",
            textDecoration: "none",
            lineHeight: 1.3,
           transition: "color 0.2s ease",
          "&:hover": {
            color: "primary.main",
          },
        
          }}
        >
          {book.title}
        </Typography>
        <Typography fontSize="0.85rem">{book.author}</Typography>
        <Typography fontSize="0.85rem" color="text.secondary">
          {formatDate(book.publishedDate)}
        </Typography>
      </Stack>

      <div
        style={{
          display: "grid",
          justifyItems: "center",
          gap: "0.5rem",
          width: "100%",
        }}
      >
        <Rating
          // value={book.averageRating}
          value={4.5}
          precision={0.5}
          readOnly
          size="small"
        />
        <BookInfoActions />
      </div>
    </Stack>
  );
};

export default BookInfoCard;
