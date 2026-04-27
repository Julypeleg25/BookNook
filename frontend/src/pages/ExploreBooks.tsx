import { Box } from "@mui/material";
import SearchBooks from "@components/search/SearchBooks";
import type { Book } from "@/models/Book";

interface ExploreBooksProps {
  isSelectMode?: boolean;
  onBookSelect?: (book: Book) => void;
}

const ExploreBooks = ({ isSelectMode = false, onBookSelect }: ExploreBooksProps) => {
  return (
    <Box sx={{ p: isSelectMode ? 0 : 3, pt: isSelectMode ? 0 : 3 }}>
      <Box sx={{ px: isSelectMode ? 3 : 0, pt: isSelectMode ? 2 : 0 }}>
        <SearchBooks isSelectMode={isSelectMode} onBookSelect={onBookSelect} />
      </Box>
    </Box>
  );
};

export default ExploreBooks;
