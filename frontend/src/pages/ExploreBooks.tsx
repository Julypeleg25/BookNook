import { Box } from "@mui/material";
import SearchBooks from "@components/search/SearchBooks";
import type { Book } from "@/models/Book";

interface ExploreBooksProps {
  isSelectMode?: boolean;
  onBookSelect?: (book: Book) => void;
}

const ExploreBooks = ({ isSelectMode = false, onBookSelect }: ExploreBooksProps) => {
  return (
    <Box
      sx={{
        minHeight: isSelectMode ? "auto" : "calc(100vh - 4.5rem)",
        bgcolor: isSelectMode ? "transparent" : "background.default",
        px: isSelectMode ? 0 : { xs: 2, md: 4 },
        py: isSelectMode ? 0 : { xs: 2.5, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: "76rem", mx: "auto", px: isSelectMode ? 3 : 0, pt: isSelectMode ? 2 : 0 }}>
        <SearchBooks isSelectMode={isSelectMode} onBookSelect={onBookSelect} />
      </Box>
    </Box>
  );
};

export default ExploreBooks;
