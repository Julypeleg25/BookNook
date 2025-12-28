import { Typography } from "@mui/material";
import { books } from "../exampleData";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import NotFound from "./NotFound";
import BookInfoHeader from "../components/bookHeaders/BookInfoHeader";
import { FaTheaterMasks } from "react-icons/fa";
import { FaUserPen } from "react-icons/fa6";
import { MdMenuBook } from "react-icons/md";
import AiBookRecommendation from "../components/post/AiBookRecommendation";

const AI_RESPONSE =
  "Based on your prompt, I believe this book will fit you perfectly";

const BookInfo = () => {
  const { id } = useParams<{ id: string }>();

  const book = useMemo(() => books.find((b) => b.id === id), [id]);

  if (!book) return <NotFound />;

  return (
    <div
      style={{
        display: "grid",
        margin: "3rem",
        alignItems: "center",
      }}
    >
      <BookInfoHeader book={book} />
      <div
        style={{
          display: "flex",
          gap: "2rem",
          marginTop: "2rem",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "grid", fontSize: "1.4rem" }}>
          <div>
            <MdMenuBook /> {book.description}
          </div>
          <div>
            <FaTheaterMasks />
            {book.genres.join(", ")}
          </div>
          <div>
            <FaUserPen /> {book.author}
          </div>
          <div>
            <FaUserPen /> {book.author}
          </div>
          <div>
            <FaUserPen /> {book.author}
          </div>
        </div>
        <img
          src={book.coverImage}
          style={{ borderRadius: "1rem" }}
          width="20%"
          height="20%"
        />
      </div>
      <AiBookRecommendation
        response={AI_RESPONSE}
        style={{ marginTop: "6rem" }}
      />
    </div>
  );
};

export default BookInfo;
