import { Box, Chip } from "@mui/material";

interface CommentsHeaderProps {
  length: number;
}

const CommentsHeader = ({ length }: CommentsHeaderProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: "4rem",
        px: { xs: "1rem", sm: "1.5rem" },
        py: 1,
        gap: "1rem",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          minWidth: 0,
        }}
      >
        <Box sx={{ fontWeight: "bold", fontSize: "1.3rem" }}>Comments</Box>
        <Chip label={length} size={"small"} />
      </Box>
    </Box>
  );
};

export default CommentsHeader;
