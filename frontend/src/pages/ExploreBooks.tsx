import { Box, Fab } from "@mui/material";
import { books } from "../exampleData";
import SearchFiltersModal from "@components/searchFilters/SearchFiltersModal";
import SearchBar from "@components/searchFilters/SearchBar";
import BookInfoCard from "@components/bookCards/BookInfoCard";
import { MdAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useInfiniteLoader } from "@hooks/useInfiniteLoader";
import { useState } from "react";

const ExploreBooks = () => {
  const navigate = useNavigate();
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  const { visibleItems, loaderRef } = useInfiniteLoader({
    items: books,
    batchSize: 20,
  });

  return (
    <Box sx={{ p: "1rem", mt: "1.5rem" }}>
      <SearchBar setIsFiltersModalOpen={setIsFiltersModalOpen} />

      <Box
        display="grid"
        mt="2rem"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "1fr 1fr",
          md: "repeat(5, 1fr)",
        }}
        gap="1.5rem"
      >
        {visibleItems.map((book) => (
          <BookInfoCard key={book.id} book={book} />
        ))}
      </Box>

      <Box ref={loaderRef} />

      <SearchFiltersModal
        open={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
      />

      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: "1.5rem", right: "1.5rem" }}
        onClick={() => navigate("/post")}
      >
        <MdAdd size="1.8rem" />
      </Fab>
    </Box>
  );
};

export default ExploreBooks;
