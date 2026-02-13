import {
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Box,
} from "@mui/material";
import {
  forwardRef,
  useImperativeHandle,
  useState,
  type ForwardedRef,
} from "react";
import { MdSend } from "react-icons/md";

interface NewCommentProps {
  avatarUrl: string;
}

export interface NewCommentRef {
  focus: () => void;
}

const NewComment = forwardRef(
  ({ avatarUrl }: NewCommentProps, ref: ForwardedRef<NewCommentRef>) => {
    const [value, setValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const inputRef = useState<HTMLInputElement | null>(null)[0];

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef?.focus();
      },
    }));

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
          inputRef={(el) => {
            if (el) inputRef?.focus();
          }}
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
          slotProps={{input:{
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
          }}}
          onKeyDown={(e) => e.key === "Enter" && sendComment()}
        />
      </Box>
    );
  }
);

export default NewComment;
