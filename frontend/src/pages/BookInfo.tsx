import { Typography } from "@mui/material";
import { books } from "../exampleData";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import NotFound from "./NotFound";
import BookInfoHeader from "../components/bookHeaders/BookInfoHeader";
import { FaTheaterMasks } from "react-icons/fa";
import { FaUserPen } from "react-icons/fa6";
import { MdMenuBook } from "react-icons/md";

const BookInfo = () => {
  const { id } = useParams<{ id: string }>();

  const book = useMemo(() => books.find((b) => b.id === id), [id]);

  if (!book) {
    return <NotFound />;
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "2rem",
        margin: "3rem",
        alignItems: "center",
      }}
    >
      <div>
        <BookInfoHeader book={book} />
        <div
          style={{
            display: "flex",
            gap: "2rem",
            marginTop: "2rem",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "grid" }}>
            <Typography fontSize={"1.6rem"}>
              <MdMenuBook /> {book.description}
            </Typography>
            <Typography fontSize={"1.6rem"}>
              <FaTheaterMasks />
              {book.genres.join(", ")}
            </Typography>
            <Typography fontSize={"1.6rem"}>
              <FaUserPen /> {book.author}
            </Typography>
            <Typography fontSize={"1.6rem"}>
              <FaUserPen /> {book.author}
            </Typography>
            <Typography fontSize={"1.6rem"}>
              <FaUserPen /> {book.author}
            </Typography>
          </div>
          <img
            src={book.coverImage}
            style={{ borderRadius: "1rem" }}
            width="20%"
            height="20%"
          />
        </div>
      </div>
    </div>
  );
};

export default BookInfo;
