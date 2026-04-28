import { Box } from "@mui/material";
import SearchPosts from "@components/search/SearchPosts";

const ExplorePosts = () => {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 4.5rem)",
        bgcolor: "background.default",
        px: { xs: 2, md: 4 },
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: "76rem", mx: "auto" }}>
        <SearchPosts />
      </Box>
    </Box>
  );
};

export default ExplorePosts;
