import { Card, CardContent, Skeleton, Stack, Box } from "@mui/material";

const PostCardSkeleton = () => {
    return (
        <Card
            sx={{
                width: "100%",
                maxWidth: "25rem",
                borderRadius: "1rem",
                boxShadow: 1,
            }}
        >
            <Box p="1rem">
                <Stack direction="row" spacing={2} alignItems="center">
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton width="60%" />
                        <Skeleton width="40%" />
                    </Box>
                </Stack>
            </Box>
            <Skeleton variant="rectangular" height="16rem" />
            <CardContent>
                <Skeleton variant="text" />
                <Skeleton variant="text" />
                <Skeleton variant="text" width="80%" />
            </CardContent>
            <Box px="1rem" pb="1rem">
                <Stack direction="row" spacing={1}>
                    <Skeleton width={60} height={24} />
                    <Skeleton width={60} height={24} />
                </Stack>
            </Box>
        </Card>
    );
};

export default PostCardSkeleton;
