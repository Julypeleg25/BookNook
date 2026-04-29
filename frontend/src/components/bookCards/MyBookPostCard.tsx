import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  Rating,
  Stack,
  Link as MuiLink,
} from "@mui/material";
import type { BookPost } from "@models/Book";
import { formatDate } from "@utils/dateUtils";
import { BsEye } from "react-icons/bs";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { FiEdit } from "react-icons/fi";
import { RATING_STEP } from "@shared/constants/validation";

interface MyBookPostCardProps {
  post: BookPost;
}

const MyBookPostCard = ({ post }: MyBookPostCardProps) => {
  const navigate = useNavigate();

  return (
    <Stack alignItems="center" spacing="0.6rem">
      <Box
        sx={{
          width: "15rem",
          height: "18rem",
          borderRadius: "0.5rem",
          boxShadow: 1,
          overflow: "hidden",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        <Box
          component="img"
          src={post.imageUrl}
          alt={post.book.title}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            bgcolor: "grey.50",
          }}
          draggable={false}
        />
      </Box>
      <Tooltip title="view book's details" arrow>
        <MuiLink
          component={RouterLink}
          to={`/books/${post.book.id}`}
          underline="none"
          color="inherit"
          sx={{
            transition: "color 0.2s ease",
            "&:hover": {
              color: "primary.main",
            },
          }}
        >
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              transition: "text-decoration 0.2s ease",
            }}
          >
            {post.book.title}
          </Typography>
        </MuiLink>
      </Tooltip>

      <Typography fontSize="0.85rem" color="text.secondary">
        {formatDate(post.createdDate)}
      </Typography>

      <Rating size="small" value={post.rating} precision={RATING_STEP} readOnly />

      <Stack direction="row" spacing="0.4rem">
        <Tooltip title="edit post">
          <IconButton size="small" onClick={() => navigate(`/post/edit/${post.id}`)}>
            <FiEdit />
          </IconButton>
        </Tooltip>
        <Tooltip title="view post">
          <IconButton
            size="small"
            onClick={() => navigate(`/posts/${post.id}`)}
          >
            <BsEye />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
};

export default MyBookPostCard;
