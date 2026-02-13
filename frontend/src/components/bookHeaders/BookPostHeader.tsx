import { Rating, Typography } from "@mui/material";
import { FaCalendar, FaUser } from "react-icons/fa6";
import { formatDate } from "../../utils/dateUtils";
import type { BookPost } from "../../models/Book";
import BookHeader from "./BookHeaderButtons";

interface BookPostHeaderProps {
  bookPost: BookPost;
}

const BookPostHeader = ({ bookPost }: BookPostHeaderProps) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "grid" }}>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "3rem" }}>{bookPost.book.title}</div>
          <div
            style={{
              fontSize: "2.5rem",
              marginRight: "1rem",
            }}
          >
            ({new Date(bookPost.book.publishedDate).getFullYear()})
          </div>
          <Rating size="large" value={bookPost.rating} readOnly />
        </div>
        <Typography variant="h5" style={{ display: "flex", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "0.3rem" }}>
            <FaCalendar />
            {formatDate(bookPost.createdDate)}
          </div>
          <div style={{ display: "flex", gap: "0.3rem" }}>
            <FaUser />
            {bookPost.user.username}
          </div>
        </Typography>
      </div>
      <BookHeader id={bookPost.book.id} isBookPost={true} />
    </div>
  );
};

export default BookPostHeader;
