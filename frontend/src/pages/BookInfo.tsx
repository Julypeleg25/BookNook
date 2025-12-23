import { Box, Typography } from "@mui/material";
import { FaCalendar } from "react-icons/fa6";
import { formatDate } from "../utils/dateUtils";
import { books } from "../exampleData";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import NotFound from "./NotFound";

const BookInfo = () => {
  const { id } = useParams<{ id: string }>();

  const book = useMemo(() => books.find((b) => b.id === id), [id]);

  if (!book) {
    return <NotFound />;
  }

  return (
    <div style={{ margin: "3rem" }}>
      <Box
        display="grid"
        gap="2rem"
        gridTemplateColumns="70% 30%"
        width="100%"
        marginTop={"2rem"}
        alignItems={"center"}
      >
        <div style={{ display: "grid" }}>
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
          <Typography variant="h5" style={{ display: "flex", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "0.3rem" }}>
              <FaCalendar />
              {formatDate(book.publishedDate)}
            </div>
          </Typography>
          <Typography marginTop={"1.5rem"} fontSize={"1.2rem"}>
            {book.description}
          </Typography>
        </div>
        <img
          src={book.coverImage}
          style={{ borderRadius: "1rem" }}
          width={"100%"}
        />
      </Box>
    </div>
  );
};

export default BookInfo;
