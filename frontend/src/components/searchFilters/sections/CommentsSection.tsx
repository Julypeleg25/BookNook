import {
  Box,
  Avatar,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import { MdSend } from "react-icons/md";
import { TbArrowsSort } from "react-icons/tb";
import { timeAgo } from "../../../utils/dateUtils";
import Select from "../../Select";
import type { BookPost } from "../../../models/Book";

interface CommentsSectionProps {
  bookPost: BookPost;
}

const CommentsSection = ({ bookPost }: CommentsSectionProps) => {
  return (
    <Box
      display="grid"
      marginTop={"3rem"}
      borderRadius={"1rem"}
      width='95%'
      justifySelf='center'
      style={{ backgroundColor: "white" }}
    >
      <div
        style={{
          display: "flex",
          alignSelf: "center",
          gap: "1rem",
          margin: "1rem",
        }}
      >
        <Avatar src={bookPost.user.avatarUrl} />
        <OutlinedInput
          placeholder="Add comment..."
          // onChange={(e) => setValue(e.target.value)}
          sx={{
            borderRadius: "1rem",
            width: "90%",
            justifySelf: "center",
            height: "6rem",
          }}
          multiline
          maxRows={3}
          inputProps={{ style: { display: "flex", alignSelf: "start" } }}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                onClick={() => {}}
                style={{ alignSelf: "end", display: "flex" }}
              >
                <MdSend />
              </IconButton>
            </InputAdornment>
          }
          // onKeyDown={(e) => {
          //   if (e.key === "Enter") handleSubmit();
          // }}
        />
      </div>
      <Divider style={{ width: "93%", justifySelf: "center", opacity: 0.3 }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            marginLeft: "3rem",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: "1.3rem" }}>Comments</div>
          <Chip label={bookPost.comments.length} size={"small"} />
        </div>
        <Select
          sx={{
            "& .MuiInputBase-input": {
              padding: "0.6rem",
            },
          }}
          style={{ marginRight: "2.5rem" }}
          label=""
          startIcon={<TbArrowsSort size={"2rem"} />}
          onChange={() => {}}
          selectedValues={["mostRecent"]}
          menuItems={[
            { label: "Most recent", value: "mostRecent" },
            { label: "Least recent", value: "leastRecent" },
          ]}
        />
      </div>
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
              <div style={{ opacity: 0.7 }}>{timeAgo(comment.createdDate)}</div>
            </div>
            <div style={{ marginLeft: "3rem" }}>{comment.content}</div>
          </Box>
        </div>
      ))}
    </Box>
  );
};

export default CommentsSection;
