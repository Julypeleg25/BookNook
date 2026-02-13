import { Box, Chip, Divider, Paper, Typography } from "@mui/material";
import type { Book } from "../../models/Book";
import { formatDate } from "../../utils/dateUtils";

interface BookInfoSectionProps {
  book: Book;
}

const BookInfoSection = ({ book }: BookInfoSectionProps) => {
  return (
    <Paper
      elevation={2}
      sx={{
        height: "100%",
        p: "2rem",
        borderRadius: "1rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6">Book Information</Typography>

      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "2fr 1fr" }}
        gap="2rem"
        alignItems="flex-start"
        mt="2rem"
      >
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap="1.2rem">
          <InfoRow label="Author" value={book.author} />
          <InfoRow label="Pages" value={book.author} />
          <InfoRow label="Language" value={book.author} />
          <InfoRow label="Published" value={formatDate(book.publishedDate)} />
          <InfoRow label="Format" value={book.author} />
        </Box>

        <Box
          sx={{
            width: "9rem",
            aspectRatio: "2 / 3",
            borderRadius: "0.75rem",
            overflow: "hidden",
            boxShadow: 3,
            backgroundColor: "grey.100",
          }}
        >
          <Box
            component="img"
            src={book.coverImage}
            alt={book.title}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>
      </Box>

      {book.genres?.length > 0 && (
        <>
          <Divider sx={{ my: "1.5rem" }} />
          <Box display="flex" gap={"1rem"} flexWrap="wrap">
            {book.genres.map((genre) => (
              <Chip key={genre} label={genre} />
            ))}
          </Box>
        </>
      )}
    </Paper>
  );
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <Box>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography fontWeight={500}>{value}</Typography>
  </Box>
);

export default BookInfoSection;
