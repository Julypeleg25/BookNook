import { Box, Skeleton } from "@mui/material";

const BookCardSkeleton = () => {
    return (
        <Box>
            <Skeleton
                variant="rectangular"
                width="15rem"
                height="18rem"
                sx={{ borderRadius: "1rem" }}
            />
            <Skeleton width="80%" sx={{ mt: 1 }} />
            <Skeleton width="60%" />
            <Skeleton width="40%" height={32} sx={{ mt: 1 }} />
        </Box>
    );
};

export default BookCardSkeleton;
