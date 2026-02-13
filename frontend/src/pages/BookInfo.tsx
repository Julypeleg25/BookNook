import { Box, Stack, Typography, Divider } from "@mui/material";
import { books } from "../exampleData";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import NotFound from "./NotFound";
import BookInfoHeader from "../components/bookHeaders/BookInfoHeader";
import { FaTheaterMasks } from "react-icons/fa";
import { FaUserPen } from "react-icons/fa6";
import { MdMenuBook, MdNumbers } from "react-icons/md";
import AiBookRecommendation from "../components/post/AiBookRecommendation";
import { GrLanguage } from "react-icons/gr";

const AI_RESPONSE =
  "Based on your prompt, I believe this book will fit you perfectly";

const BookInfo = () => {
  const { id } = useParams<{ id: string }>();

  const book = useMemo(() => books.find((b) => b.id === id), [id]);

  if (!book) return <NotFound />;

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
            <Typography variant="body1">{book.description}</Typography>
          </Stack>
          <Divider />
          <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
            gap="1.5rem"
          >
            <InfoRow icon={<FaUserPen />} label="Author" value={book.author} />
            <InfoRow
              icon={<GrLanguage />}
              label="Language"
              value={book.author}
            />
            <InfoRow icon={<MdNumbers />} label="Pages" value={300} />
            <InfoRow
              icon={<FaTheaterMasks />}
              label="Genres"
              value={book.genres.join(", ")}
            />
              <InfoRow
              icon={<GrLanguage />}
              label="Language"
              value={book.author}
            />
            <InfoRow icon={<MdNumbers />} label="Pages" value={300} />
            <InfoRow
              icon={<FaTheaterMasks />}
              label="Genres"
              value={book.genres.join(", ")}
            />
              <InfoRow
              icon={<GrLanguage />}
              label="Language"
              value={book.author}
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
