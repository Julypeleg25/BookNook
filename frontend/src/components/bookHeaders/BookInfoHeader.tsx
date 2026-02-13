import type { Book } from "../../models/Book";
import BookHeader from "./BookHeaderButtons";

interface BookInfoHeaderProps {
  book: Book;
}

const BookInfoHeader = ({ book }: BookInfoHeaderProps) => {
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
          <div style={{ fontSize: "3rem" }}>{book.title}</div>
          <div
            style={{
              fontSize: "2.5rem",
              marginRight: "1rem",
            }}
          >
            ({new Date(book.publishedDate).getFullYear()})
          </div>
        </div>
        <BookHeader id={book.id} />
      </div>
   
    </div>
  );
};

export default BookInfoHeader;
