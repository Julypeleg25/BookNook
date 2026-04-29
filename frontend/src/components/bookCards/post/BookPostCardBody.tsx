import { Avatar, Box, Chip, Stack, Typography } from "@mui/material";
import type { BookPost } from "@models/Book";
import { formatDate } from "@/utils/dateUtils";
import { getAvatarSrcUrl } from "@/utils/userUtils";

interface BookPostCardBodyProps {
  genres: string[];
  post: BookPost;
  preview: string;
}

const BookPostCardBody = ({ genres, post, preview }: BookPostCardBodyProps) => (
  <Stack spacing={2} sx={{ p: 2.5, flex: 1 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1.5}>
      <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
        <Avatar
          src={getAvatarSrcUrl(post.user.avatar)}
          alt={post.user.username}
          sx={{
            width: 40,
            height: 40,
            border: "2px solid",
            borderColor: "primary.light",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        />
        <Box minWidth={0}>
          <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ lineHeight: 1.2 }}>
            @{post.user.username}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {formatDate(post.createdDate)}
          </Typography>
        </Box>
      </Stack>
    </Stack>

    <Typography
      variant="body2"
      color="text.secondary"
      sx={{
        lineHeight: 1.8,
        minHeight: "5.4rem",
        overflowWrap: "anywhere",
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      {preview}
    </Typography>

    {genres.length > 0 && (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {genres.slice(0, 3).map((genre) => (
          <Chip
            key={genre}
            label={genre}
            size="small"
            variant="outlined"
            title={genre}
            sx={{
              maxWidth: "9.5rem",
              height: "22px",
              fontSize: "0.7rem",
              fontWeight: 600,
              bgcolor: "rgba(0,0,0,0.02)",
              borderColor: "divider",
            }}
          />
        ))}
      </Stack>
    )}
  </Stack>
);

export default BookPostCardBody;
