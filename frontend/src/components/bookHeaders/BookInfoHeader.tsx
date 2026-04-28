import { Typography } from "@mui/material";
import type { Book } from "@models/Book";
import BookHeader from "./BookHeaderButtons";

interface BookInfoHeaderProps {
  book: Book;
}

const BookInfoHeader = ({ book }: BookInfoHeaderProps) => {
  const year = book.publishedDate ? new Date(book.publishedDate).getFullYear() : "Unknown";

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" style={{ gap: "0.5rem", display: "flex", alignItems: "center" }}>
            <div>{book.title}</div>
            <div style={{ color: "gray", fontSize: "1.5rem" }}>({year})</div>
          </Typography>
        </div>
        <BookHeader book={book} />
      </div>
    </div>
  );
};

export default BookInfoHeader;
