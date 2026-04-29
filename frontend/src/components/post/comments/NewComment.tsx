import { getAvatarSrcUrl } from "@/utils/userUtils";
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
  useRef,
  type ForwardedRef,
} from "react";
import { MdSend } from "react-icons/md";
import {
  COMMENT_TEXT_MAX_LENGTH,
  COMMENT_TEXT_MIN_LENGTH,
} from "@shared/constants/validation";

interface NewCommentProps {
  avatarUrl?: string;
  onSubmit?: (comment: string) => void;
}

export interface NewCommentRef {
  focus: () => void;
}

const NewComment = forwardRef(
  ({ avatarUrl, onSubmit }: NewCommentProps, ref: ForwardedRef<NewCommentRef>) => {
    const [value, setValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    const sendComment = () => {
      const normalizedValue = value.trim();

      if (normalizedValue.length < COMMENT_TEXT_MIN_LENGTH) {
        setError("Required");
        return;
      }
      if (normalizedValue.length > COMMENT_TEXT_MAX_LENGTH) {
        setError(`Max ${COMMENT_TEXT_MAX_LENGTH} characters`);
        return;
      }
      if (onSubmit) {
        onSubmit(normalizedValue);
        setValue("");
      }
    };

    return (
      <Box
        sx={{
          display: "flex",
          alignSelf: "center",
          gap: "1rem",
          p: "1rem",
          position: "sticky",
          top: 0,
          bgcolor: "background.paper",
          zIndex: 1000,
          alignItems: "center",
        }}
      >
        <Avatar src={getAvatarSrcUrl(avatarUrl)} alt="User Avatar" />
        <TextField
          inputRef={inputRef}
          placeholder="Add comment..."
          sx={{
            borderRadius: "1rem",
            width: "90%",
            justifySelf: "center",
          }}
          fullWidth
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          error={Boolean(error)}
          helperText={error ?? `${value.length}/${COMMENT_TEXT_MAX_LENGTH}`}
          multiline
          maxRows={3}
          slotProps={{
            htmlInput: {
              maxLength: COMMENT_TEXT_MAX_LENGTH,
            },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={sendComment}
                    disabled={!value.trim()}
                    edge="end"
                    color="primary"
                  >
                    <MdSend />
                  </IconButton>
                </InputAdornment>
              ),
            }

          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendComment();
            }
          }}
        />
      </Box>
    );
  }
);

export default NewComment;
