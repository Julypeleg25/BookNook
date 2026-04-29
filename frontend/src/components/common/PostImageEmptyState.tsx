import { Box, Stack, Typography } from "@mui/material";
import { FiImage } from "react-icons/fi";

const PostImageEmptyState = () => (
  <Stack spacing={1.25} alignItems="center" sx={{ px: 3, textAlign: "center" }}>
    <Box
      sx={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        bgcolor: "rgba(91, 111, 106, 0.12)",
        color: "primary.main",
      }}
    >
      <FiImage size={24} />
    </Box>
    <Typography fontWeight={800}>Drop an image here</Typography>
    <Typography variant="body2" color="text.secondary">
      or browse from your device
    </Typography>
  </Stack>
);

export default PostImageEmptyState;
