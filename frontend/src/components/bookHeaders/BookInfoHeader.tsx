import { Box, Stack, Typography } from "@mui/material";
import type { Book } from "@models/Book";
import BookHeader from "./BookHeaderButtons";

interface BookInfoHeaderProps {
  book: Book;
}

const BookInfoHeader = ({ book }: BookInfoHeaderProps) => {
  const year = book.publishedDate ? new Date(book.publishedDate).getFullYear() : "Unknown";

  return (
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={2}>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            display: "flex",
            alignItems: "baseline",
            gap: 1,
            minWidth: 0,
          }}
        >
          <Box component="span" sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {book.title}
          </Box>
          <Box component="span" sx={{ color: "text.secondary", fontSize: "1.5rem", flexShrink: 0 }}>
            ({year})
          </Box>
        </Typography>
      </Box>
      <BookHeader book={book} />
    </Stack>
  );
};

export default BookInfoHeader;
