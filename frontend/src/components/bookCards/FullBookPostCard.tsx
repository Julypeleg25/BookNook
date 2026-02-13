import {
  Box,
  Card,
  CardContent,
  Rating,
  Stack,
  Typography,
  Link as MuiLink,
  Tooltip,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { BookPost } from "../../models/Book";
import { FaRegComment } from "react-icons/fa6";
import { FiHeart } from "react-icons/fi";
import { useState } from "react";
import DeleteModal from "../DeleteModal";
import FullPostActions from "./FullPostActions";

const FullBookPostCard = ({ post }: { post: BookPost }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <Card elevation={2} sx={{ borderRadius: "1.2rem", padding: "1.2rem" }}>
      <CardContent sx={{ padding: 0 }}>
        <Stack direction="row" spacing="1.5rem">
          <Box
            component="img"
            src={post.imageUrl}
            alt={post.book.title}
            sx={{
              width: "11rem",
              height: "14rem",
              borderRadius: "1rem",
              objectFit: "cover",
            }}
          />

          <Stack spacing="1rem" flex={1}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Tooltip title="View book's details" arrow>
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
                      fontSize: "1.4rem",
                      fontWeight: 600,
                      transition: "text-decoration 0.2s ease",
                    }}
                  >
                    {post.book.title}
                  </Typography>
                </MuiLink>
              </Tooltip>
              <FullPostActions
                postId={post.id}
                setIsDeleteModalOpen={setIsDeleteModalOpen}
              />
            </Stack>

            <Stack direction="row" alignItems="center" spacing="0.5rem">
              <Typography fontWeight={500}>Your rating:</Typography>
              <Rating value={post.rating} readOnly size="small" />
            </Stack>

            <Typography color="text.secondary">
              {post.description.slice(0, 260)}…
            </Typography>

            <Stack direction="row" spacing="1.2rem" alignItems="center">
              <Stack direction="row" gap="0.4rem" alignItems="center">
                <FaRegComment /> {post.comments.length}
              </Stack>
              <Stack direction="row" gap="0.4rem" alignItems="center">
                <FiHeart /> {post.likes}
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => setIsDeleteModalOpen(false)}
      />
    </Card>
  );
};

export default FullBookPostCard;
