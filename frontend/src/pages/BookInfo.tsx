import { Box, Paper, Stack, Divider, Skeleton } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NotFound from "./NotFound";
import BookInfoHeader from "@components/bookHeaders/BookInfoHeader";
import { booksService, BookDetail } from "@/api/services/bookService";
import BookInfoSection from "@components/post/BookInfoSection";

const BookInfo = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const { book } = await booksService.getById(id);
        setBook(book);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 4.5rem)", px: { xs: 2, md: 4 }, py: { xs: 2.5, md: 4 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ maxWidth: "76rem", mx: "auto" }}>
          <Skeleton variant="text" width="40%" height={60} />
          <Skeleton variant="rectangular" width="30%" height={40} />
        </Stack>
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "2fr 1fr" }}
          gap="3rem"
          mt="3rem"
          alignItems="start"
          sx={{ maxWidth: "76rem", mx: "auto" }}
        >
          <Stack spacing={3}>
            <Skeleton variant="text" width="100%" height={24} />
            <Skeleton variant="text" width="100%" height={24} />
            <Skeleton variant="text" width="80%" height={24} />
            <Divider />
            <Box
              display="grid"
              gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
              gap="1.5rem"
            >
              {[...Array(4)].map((_, i) => (
                <Stack key={i} direction="row" spacing={1.2} alignItems="center">
                  <Skeleton variant="circular" width={24} height={24} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="40%" />
                    <Skeleton width="60%" />
                  </Box>
                </Stack>
              ))}
            </Box>
          </Stack>
          <Box display="flex" justifyContent="center">
            <Skeleton
              variant="rectangular"
              width="18rem"
              height="25rem"
              sx={{ borderRadius: "1rem" }}
            />
          </Box>
        </Box>
      </Box>
    );
  }
  if (error || !book) return <NotFound />;

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 4.5rem)",
        bgcolor: "background.default",
        px: { xs: 2, md: 4 },
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Stack spacing={3} sx={{ maxWidth: "76rem", mx: "auto" }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            bgcolor: "background.paper",
          }}
        >
          <BookInfoHeader book={book} />
        </Paper>

        <BookInfoSection book={book} />
      </Stack>
    </Box>
  );
};

export default BookInfo;
