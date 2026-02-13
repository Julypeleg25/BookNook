import { Box, Button, IconButton, TextField } from "@mui/material";
import BookPostCard from "../components/BookPostCard";
import { bookPosts } from "../exampleData";
import type { BookPost } from "../models/Book";
import { HiOutlineAdjustmentsVertical } from "react-icons/hi2";
import { useState } from "react";
import SearchFiltersModal from "../components/SearchFiltersModal";

const Explore = () => {
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  return (
    <div style={{ padding: "1rem", marginTop: "1.2rem" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <TextField
          label="Search books by title or author"
          variant="outlined"
          style={{ width: "40%" }}
        />
        <IconButton onClick={() => setIsFiltersModalOpen(true)}>
          <HiOutlineAdjustmentsVertical size={"2rem"} />
        </IconButton>
        <Button style={{ marginLeft: "0.6rem" }}>Search</Button>
      </div>
      <Box
        display="grid"
        marginTop={"3rem"}
        gridTemplateColumns={{
          xs: "1fr",
          sm: "1fr 1fr",
          md: "1fr 1fr 1fr 1fr",
        }}
        gap={"2rem"}
      >
        {bookPosts.map((post: BookPost) => (
          <BookPostCard key={post.id} book={post} />
        ))}
      </Box>
      <SearchFiltersModal
        open={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
      />
    </div>
  );
};
export default Explore;
