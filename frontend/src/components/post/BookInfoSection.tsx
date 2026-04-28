import { Box, Chip, Divider, Paper, Rating, Stack, Typography } from "@mui/material";
import type { Book } from "@models/Book";
import { formatDate } from "@utils/dateUtils";
import { getAvatarSrcUrl } from "@/utils/userUtils";
import { RATING_STEP } from "@shared/constants/validation";

interface BookInfoSectionProps {
  book: Book;
}

interface InfoRowProps {
  label: string;
  value: string | number;
}

const BookInfoSection = ({ book }: BookInfoSectionProps) => {
  const description = book.description?.replace(/<[^>]*>?/gm, "").trim();
  const genres = book.genres?.length ? book.genres : book.categories ?? [];
  const hasCommunityRating = typeof book.avgRating === "number" && (book.ratingCount ?? 0) > 0;

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        p: { xs: 2, md: 3 },
        borderRadius: "1rem",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0, fontWeight: 800 }}>
            Book Information
          </Typography>
          <Typography variant="h5" fontWeight={800}>
            {book.title}
          </Typography>
          <Typography color="text.secondary">
            {(book.authors?.length ?? 0) > 0 ? book.authors.join(", ") : "Unknown Author"}
          </Typography>
        </Stack>

        <Divider />

        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "12rem minmax(0, 1fr)" }}
          gap={{ xs: 2, md: 3 }}
          alignItems="start"
        >
          <Box
            sx={{
              width: { xs: "10rem", sm: "11rem", md: "100%" },
              maxWidth: "12rem",
              aspectRatio: "2 / 3",
              borderRadius: "0.75rem",
              overflow: "hidden",
              boxShadow: "0 14px 34px rgba(31, 41, 51, 0.16)",
              backgroundColor: "grey.100",
              justifySelf: { xs: "start", md: "center" },
            }}
          >
            <Box
              component="img"
              src={getAvatarSrcUrl(book.thumbnail)}
              alt={book.title}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>

          <Stack spacing={2.5} minWidth={0}>
            <Box
              display="grid"
              gridTemplateColumns={{ xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }}
              gap={1.5}
            >
              <InfoRow label="Pages" value={book.pageCount ?? "N/A"} />
              <InfoRow label="Published" value={book.publishedDate ? formatDate(book.publishedDate) : "N/A"} />
              <InfoRow
                label="Community"
                value={hasCommunityRating ? `${book.avgRating!.toFixed(1)} (${book.ratingCount})` : "No ratings yet"}
              />
            </Box>

            {hasCommunityRating && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Rating
                  value={book.avgRating}
                  precision={RATING_STEP}
                  readOnly
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  Average reader rating
                </Typography>
              </Stack>
            )}

            {genres.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Genres
                </Typography>
                <Box display="flex" gap={0.75} flexWrap="wrap">
                  {genres.map((genre) => (
                    <Chip key={genre} label={genre} size="small" />
                  ))}
                </Box>
              </Box>
            )}

            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Description
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                {description || "No description available for this book."}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

const InfoRow = ({ label, value }: InfoRowProps) => (
  <Box>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography fontWeight={500}>{value}</Typography>
  </Box>
);

export default BookInfoSection;
