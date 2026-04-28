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
        borderRadius: 2,
        p: { xs: 2, md: 2.5 },
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography fontWeight={800}>Publish</Typography>
          <Typography variant="body2" color="text.secondary">
            Save when the visual, rating, and review are ready.
          </Typography>
        </Box>

        <Stack spacing={1.25}>
          <Button
            type="submit"
            variant="contained"
            disabled={disabled}
            fullWidth
            size="large"
          >
            {isSaving ? "Saving..." : (isEditMode ? "Update Post" : "Publish Post")}
          </Button>
          <Button variant="outlined" onClick={onCancel} disabled={isSaving} fullWidth>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default PostPublishSection;
