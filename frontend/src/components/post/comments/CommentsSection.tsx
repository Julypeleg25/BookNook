import { Box, Avatar, Divider, Chip } from "@mui/material";
import { TbArrowsSort } from "react-icons/tb";
import { timeAgo } from "../../../utils/dateUtils";
import Select from "../../common/Select";
import type { BookPost } from "../../../models/Book";
import NewComment from "./NewComment";
import CommentsHeader from "./CommentsHeader";

interface CommentsSectionProps {
  bookPost: BookPost;
}

const CommentsSection = ({ bookPost }: CommentsSectionProps) => {
  return (
    <Box
      sx={{
        borderRadius: "1rem",
        maxHeight: "30rem",
        overflowY: "scroll",
        marginTop: "2rem",
      }}
    >
      <Box
        justifySelf="center"
        style={{ backgroundColor: "white" }}
        width="100%"
      >
        <NewComment avatarUrl={bookPost.user.avatarUrl} />
        <Divider
          style={{ width: "93%", justifySelf: "center", opacity: 0.3 }}
        />
        <CommentsHeader length={bookPost.comments.length} />
        {bookPost.comments.map((comment) => (
          <div>
            <Box style={{ padding: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Avatar src={comment.user.avatarUrl} />
                <div style={{ fontWeight: "bold", fontSize: "1.15rem" }}>
                  {comment.user.username}
                </div>
                <div style={{ opacity: 0.7 }}>
                  {timeAgo(comment.createdDate)}
                </div>
              </div>
              <div style={{ marginLeft: "3rem" }}>{comment.content}</div>
            </Box>
          </div>
        ))}
      </Box>
    </Box>
  );
};

export default CommentsSection;
