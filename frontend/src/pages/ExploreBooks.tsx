import { Box } from "@mui/material";
import { books } from "../exampleData";
import type { Book } from "../models/Book";
import { useState } from "react";
import SearchFiltersModal from "../components/searchFilters/SearchFiltersModal";
import SearchBar from "../components/searchFilters/SearchBar";
import BookInfoCard from "../components/bookCards/BookInfoCard";

const ExploreBooks = () => {
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  return (
    <div style={{ padding: "1rem", marginTop: "1.2rem" }}>
      <SearchBar setIsFiltersModalOpen={setIsFiltersModalOpen} />
      <Box
        display="grid"
        marginTop={"3rem"}
        gridTemplateColumns={{
          xs: "1fr",
          sm: "1fr 1fr",
          md: "1fr 1fr 1fr 1fr 1fr",
        }}
        gap={"2rem"}
      >
        {books.map((book: Book) => (
          <BookInfoCard key={book.id} book={book} />
        ))}
      </Box>
      <SearchFiltersModal
        open={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
      />
    </div>
  );
};
export default ExploreBooks;
