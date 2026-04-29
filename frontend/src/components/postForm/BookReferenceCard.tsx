import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import type { SyntheticEvent } from "react";
import type { Book } from "@/models/Book";
import { getAvatarSrcUrl } from "@/utils/userUtils";
import { BOOK_COVER_FALLBACK_URL } from "../bookCards/BookInfoCard";

interface BookReferenceCardProps {
  book: Book;
}

const BookReferenceCard = ({ book }: BookReferenceCardProps) => {
  const description = book.description?.replace(/<[^>]*>?/gm, "").trim();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 2, md: 2.5 }}
        alignItems={{ xs: "stretch", sm: "stretch" }}
      >
        <Box
          sx={{
            width: { xs: "100%", sm: "9rem", md: "10rem" },
            maxWidth: { xs: "14rem", sm: "9rem", md: "10rem" },
            flexShrink: 0,
            alignSelf: { xs: "center", sm: "center" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            component="img"
            src={getAvatarSrcUrl(book.thumbnail)}
            onError={(event: SyntheticEvent<HTMLImageElement, Event>) => {
              event.currentTarget.src = BOOK_COVER_FALLBACK_URL;
            }}
            alt={book.title}
            sx={{
              width: "auto",
              maxWidth: "100%",
              height: "auto",
              maxHeight: { xs: "18rem", sm: "15rem", md: "17rem" },
              objectFit: "contain",
              display: "block",
              borderRadius: 1.5,
              boxShadow: "0 16px 36px rgba(31, 41, 51, 0.18)",
            }}
          />
        </Box>

        <Stack spacing={1.1} minWidth={0} justifyContent="center" flex={1}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0, fontWeight: 800 }}>
            Book Reference
          </Typography>
          <Stack direction="row" spacing={1} alignItems="baseline" minWidth={0}>
            <Typography
              variant="h5"
              title={book.title}
              sx={{
                fontWeight: 800,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {book.title}
            </Typography>
            {book.publishedDate && (
              <Chip
                size="small"
                label={new Date(book.publishedDate).getFullYear()}
                variant="outlined"
                sx={{ flexShrink: 0 }}
              />
            )}
          </Stack>
          <Typography variant="body1" color="text.secondary">
            {(book.authors?.length ?? 0) > 0 ? book.authors.join(", ") : "Unknown Author"}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {book.pageCount ? (
              <Chip size="small" label={`${book.pageCount} pages`} variant="outlined" />
            ) : null}
            {(book.categories ?? []).slice(0, 3).map((genre) => (
              <Chip key={genre} size="small" label={genre} />
            ))}
          </Stack>
          {description && (
            <Box
              sx={{
                mt: 0.5,
                pt: 1.5,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                Description
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: { xs: 4, md: 5 },
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.7,
                }}
              >
                {description}
              </Typography>
            </Box>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default BookReferenceCard;
