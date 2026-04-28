import { Box, Button, Stack, Typography } from "@mui/material";

interface PostPublishSectionProps {
  disabled: boolean;
  isEditMode: boolean;
  isSaving: boolean;
  onCancel: () => void;
}

const PostPublishSection = ({
  disabled,
  isEditMode,
  isSaving,
  onCancel,
}: PostPublishSectionProps) => {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        p: { xs: 2, md: 2.5 },
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={800}>Publish</Typography>
          <Typography variant="body2" color="text.secondary">
            Save when the visual, rating, and review are ready.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ width: { xs: "100%", md: "auto" } }}>
          <Button variant="outlined" onClick={onCancel} disabled={isSaving} sx={{ width: { xs: "100%", sm: "auto" }, minWidth: { sm: "8rem" } }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={disabled}
            size="large"
            sx={{ width: { xs: "100%", sm: "auto" }, minWidth: { sm: "11rem" } }}
          >
            {isSaving ? "Saving..." : (isEditMode ? "Update Review" : "Publish Review")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default PostPublishSection;
