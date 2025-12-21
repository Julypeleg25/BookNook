import { useParams } from "react-router-dom";
import { bookPosts } from "../exampleData";
import { useMemo } from "react";
import NotFound from "./NotFound";
import { Avatar, Box, Card, Rating, Typography } from "@mui/material";
import { BiCalendar, BiUser } from "react-icons/bi";
import { CgUser } from "react-icons/cg";
import { FaCalendar, FaUser } from "react-icons/fa6";
import { MdOutlineRateReview } from "react-icons/md";
import { formatDate } from "../utils/dateUtils";
import { SlCalender } from "react-icons/sl";

const BookPostDetails = () => {
  const { id } = useParams<{ id: string }>();

  const bookPost = useMemo(
    () => bookPosts.find((post) => post.id === id),
    [id]
  );

  if (!bookPost) {
    return <NotFound />;
  }

  return (
    <div style={{ margin: "1rem" }}>
      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ display: "grid" }}>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <div style={{ gap: "1rem", display: "flex", fontSize: "3rem" }}>
              <div>{bookPost.book.title}</div>
              <div>({new Date(bookPost.book.publishedDate).getFullYear()})</div>
            </div>
            <Rating value={bookPost.rating} />
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
          <Box>
            <Typography alignItems={"center"} display={"flex"}>
              {bookPost.description}
            </Typography>
            {/* <Typography alignItems={"center"} display={"flex"}>
              <MdOutlineRateReview />
              {/* {bookPost.user} */}
            {/* </Typography> */}
          </Box>
          <Box display={'flex'}>
            {bookPost.comments.map((comment) => (
              <Card style={{  width: "16rem", padding: "1rem" }}>
                <div style={{ display: "flex",alignItems:'center',gap:'1rem' }}>
                  <Avatar src={comment.user.avatarUrl} />
                  {comment.user.username}
                </div>
                <div style={{ width: "10rem" }}>{comment.content}</div>
              </Card>
            ))}
          </Box>
        </div>
        <img src={bookPost.imageUrl} style={{ borderRadius: "1rem" }} />
      </div>
    </div>
  );
};

export default BookPostDetails;
