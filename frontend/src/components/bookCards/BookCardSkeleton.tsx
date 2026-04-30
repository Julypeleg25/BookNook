import { Skeleton, Stack } from "@mui/material";

interface BookCardSkeletonProps {
  showAction?: boolean;
}

const BookCardSkeleton = ({
  showAction = false,
}: BookCardSkeletonProps) => {
  return (
    <Stack alignItems="center" spacing="0.6rem" width="15rem">
      <Skeleton
        variant="rectangular"
        width="15rem"
        height="18rem"
        sx={{
          borderRadius: "1rem",
        }}
      />
      <Stack spacing="0.2rem" width="15rem">
        <Skeleton variant="text" width="100%" height="1.3rem" />
        <Skeleton variant="text" width="72%" height="1.3rem" />
        <Skeleton variant="text" width="62%" height="1.2rem" />
        <Skeleton variant="text" width="46%" height="1.2rem" />
      </Stack>
      {showAction && (
        <Skeleton
          variant="rounded"
          width="15rem"
          height="1.9rem"
          sx={{ borderRadius: 1 }}
        />
      )}
    </Stack>
  );
};

export default BookCardSkeleton;
