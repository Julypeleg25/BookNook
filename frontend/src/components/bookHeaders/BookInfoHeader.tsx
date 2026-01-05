import { IconButton, Tooltip, Typography } from "@mui/material";
import type { Book } from "@models/Book";
import BookHeader from "./BookHeaderButtons";
import { BiArrowBack } from "react-icons/bi";
import useNav from "@hooks/useNav";

interface BookInfoHeaderProps {
  book: Book;
}

const BookInfoHeader = ({ book }: BookInfoHeaderProps) => {
  const { goBack } = useNav();

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
          <Typography variant="h4" style={{ gap: "0.5rem", display: "flex" }}>
            <Tooltip title="Go Back">
              <IconButton onClick={goBack} sx={{ mb: "1rem" }}>
                <BiArrowBack />
              </IconButton>
            </Tooltip>
            <div>{book.title}</div>
            <div>({new Date(book.publishedDate).getFullYear()})</div>
          </Typography>
        </div>
        <BookHeader id={book.id} />
      </div>
    </div>
  );
};

export default BookInfoHeader;
