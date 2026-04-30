import { Box, Card, Skeleton, Stack } from "@mui/material";

const PostCardSkeleton = () => (
  <Card
    elevation={0}
    sx={{
      width: "100%",
      maxWidth: "26rem",
      borderRadius: 2,
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.paper",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}
  >
    <Box sx={{ position: "relative", aspectRatio: "16 / 10", overflow: "hidden" }}>
      <Skeleton variant="rectangular" width="100%" height="100%" />
      <Box sx={{ position: "absolute", left: 20, right: 20, bottom: 18 }}>
        <Skeleton variant="text" width="76%" height="1.7rem" />
        <Skeleton variant="text" width="45%" height="1.2rem" />
      </Box>
    </Box>

    <Stack spacing={2} sx={{ p: 2.5, flex: 1 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="48%" height="1.2rem" />
          <Skeleton variant="text" width="34%" height="1rem" />
        </Box>
      </Stack>

      <Box sx={{ minHeight: "5.4rem" }}>
        <Skeleton variant="text" width="100%" height="1.2rem" />
        <Skeleton variant="text" width="94%" height="1.2rem" />
        <Skeleton variant="text" width="78%" height="1.2rem" />
      </Box>

      <Stack direction="row" spacing={1}>
        <Skeleton variant="rounded" width="4.5rem" height="22px" />
        <Skeleton variant="rounded" width="5rem" height="22px" />
        <Skeleton variant="rounded" width="4rem" height="22px" />
      </Stack>
    </Stack>

    <Stack
      direction="row"
      spacing={2}
      sx={{
        px: 2.5,
        py: 1.5,
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.default",
      }}
    >
      <Skeleton variant="rounded" width="3.5rem" height="1.5rem" />
      <Skeleton variant="rounded" width="3.5rem" height="1.5rem" />
    </Stack>
  </Card>
);

export default PostCardSkeleton;
