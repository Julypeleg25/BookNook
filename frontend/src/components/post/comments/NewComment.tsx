import {
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Box,
} from "@mui/material";
import { useState } from "react";
import { MdSend } from "react-icons/md";

interface NewCommentProps {
  avatarUrl: string;
}

const NewComment = ({ avatarUrl }: NewCommentProps) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sendComment = () => {
    if (!value.trim()) {
      setError("Required");
      return;
    }

    // TODO: add comment
  };

  return (
    <Box
      style={{
        display: "flex",
        alignSelf: "center",
        gap: "1rem",
        padding: "1rem",
        position: "sticky",
        top: 0,
        backgroundColor: "white",
        zIndex: 1000,
      }}
    >
      <Avatar src={avatarUrl} />
      <TextField
        placeholder="Add comment..."
        sx={{
          borderRadius: "1rem",
          width: "90%",
          justifySelf: "center",
          height: "6rem",
        }}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError(null);
        }}
        error={Boolean(error)}
        helperText={error ?? `${value?.length || 0}/500`}
        multiline
        maxRows={3}
        slotProps={{
          htmlInput: { maxLength: 500 },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={sendComment}
                  disabled={!value.trim()}
                  edge="end"
                >
                  <MdSend />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        onKeyDown={(e) => e.key === "Enter" && sendComment()}
      />
    </Box>
  );
};

export default NewComment;
