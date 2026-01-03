import { IconButton, Rating, Tooltip, Typography } from "@mui/material";
import { FaCalendar, FaUser } from "react-icons/fa6";
import { formatDate } from "../../utils/dateUtils";
import type { BookPost } from "../../models/Book";
import BookHeader from "./BookHeaderButtons";
import { BiArrowBack } from "react-icons/bi";
import useNav from "../../hooks/useNav";

interface BookPostHeaderProps {
  bookPost: BookPost;
}

const BookPostHeader = ({ bookPost }: BookPostHeaderProps) => {
  const { goBack } = useNav();
  
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "grid", gap: "1rem" }}>
        <Typography variant="h4" style={{ gap: "0.5rem", display: "flex" }}>
          <Tooltip title="Go Back">
            <IconButton onClick={goBack} sx={{ mb: "1rem" }}>
              <BiArrowBack />
            </IconButton>
          </Tooltip>
          <div>{bookPost.book.title}</div>
          <div>({new Date(bookPost.book.publishedDate).getFullYear()})</div>
        </Typography>
        <Rating size="large" value={bookPost.rating} readOnly />
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
