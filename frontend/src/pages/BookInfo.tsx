import { Box, Stack, Typography, Divider, Skeleton } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NotFound from "./NotFound";
import BookInfoHeader from "@components/bookHeaders/BookInfoHeader";
import { FaTheaterMasks } from "react-icons/fa";
import { FaUserPen } from "react-icons/fa6";
import { MdMenuBook, MdNumbers } from "react-icons/md";
import AiBookRecommendation from "@components/post/AiBookRecommendation";
import { GrLanguage } from "react-icons/gr";
import { booksService, BookDetail } from "@/api/services/bookService";
import { formatDate } from "@/utils/dateUtils";

const AI_RESPONSE = "Based on your prompt, I believe this book will fit you perfectly";

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
      <Box sx={{ margin: "1.5rem", px: "1rem", py: "2rem" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Skeleton variant="text" width="40%" height={60} />
          <Skeleton variant="rectangular" width="30%" height={40} />
        </Stack>
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "2fr 1fr" }}
          gap="3rem"
          mt="3rem"
          alignItems="start"
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

  const displayAuthors = book.authors?.join(", ") || "Unknown Author";
  const displayGenres = book.categories?.join(", ") || "Unknown Genre";

  return (
    <Box sx={{ margin: "1.5rem", px: "1rem", py: "2rem" }}>
      <BookInfoHeader book={book} />

      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "2fr 1fr" }}
        gap="3rem"
        mt="3rem"
        alignItems="start"
      >
        <Stack spacing={3}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <MdMenuBook size={"1.5rem"} />
            <Typography variant="body1">
              {book.description?.replace(/<[^>]*>?/gm, "") || "No description available."}
            </Typography>
          </Stack>
          <Divider />
          <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
            gap="1.5rem"
          >
            <InfoRow icon={<FaUserPen />} label="Author" value={displayAuthors} />
            <InfoRow icon={<MdNumbers />} label="Pages" value={book.pageCount || "N/A"} />
            <InfoRow
              icon={<FaTheaterMasks />}
              label="Genres"
              value={displayGenres}
            />
            <InfoRow
              icon={<GrLanguage />}
              label="Published"
              value={book.publishedDate ? formatDate(book.publishedDate) : "N/A"}
            />
          </Box>
        </Stack>
        <Box display="flex" justifyContent="center">
          <Box
            sx={{
              width: "18rem",
              borderRadius: "1rem",
              overflow: "hidden",
              boxShadow: 4,
            }}
          >
            {book.thumbnail && (
              <Box
                component="img"
                src={book.thumbnail}
                alt={book.title}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
      <Box mt="5rem">
        <AiBookRecommendation response={AI_RESPONSE} />
      </Box>
    </Box>
  );
};

export default BookInfo;

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <Stack direction="row" spacing={1.2} alignItems="center">
    {icon}
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={500}>{value}</Typography>
    </Box>
  </Stack>
);
