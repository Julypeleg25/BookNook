import { Rating, Typography, Button } from "@mui/material";
import { BiStar } from "react-icons/bi";
import { BsBook } from "react-icons/bs";
import { CiRead } from "react-icons/ci";
import { FaCalendar, FaUser } from "react-icons/fa6";
import { formatDate } from "../utils/dateUtils";
import type { BookPost } from "../models/Book";
import { useNavigate } from "react-router-dom";

interface BookPostHeaderProps {
  bookPost: BookPost;
}

const BookPostHeader = ({ bookPost }: BookPostHeaderProps) => {
  const navigate = useNavigate();

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
          <Rating size="large" value={bookPost.rating} readOnly/>
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between", 
          width: "40%", 
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/books/${bookPost.book.id}`)}
          startIcon={<BsBook />}
        >
          Go to book page
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/books/${bookPost.book.id}`)}
          startIcon={<BiStar />}
        >
          Add to my wish list
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/books/${bookPost.book.id}`)}
          startIcon={<CiRead />}
        >
          Add to my read list
        </Button>
      </div>
    </div>
  );
};

export default BookPostHeader;
