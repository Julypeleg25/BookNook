import useUserStore from "@/state/useUserStore";
import BooksList from "@components/lists/BooksList";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { BsBookmark } from "react-icons/bs";
import { LuBookCheck } from "react-icons/lu";
import { ListsService } from "@/api/services/ListsService";
import { queryKeys } from "@/api/queryKeys";

const MyLists = () => {
  const {
    user: { username },
  } = useUserStore();
  const { data: wishlistBooks = [], isLoading: isWishlistLoading } = useQuery({
    queryKey: queryKeys.wishlist(username),
    queryFn: ListsService.getWishlistBooks,
  });

  const { data: readlistBooks = [], isLoading: isReadlistLoading } = useQuery({
    queryKey: queryKeys.readlist(username),
    queryFn: ListsService.getReadlistBooks,
  });
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 4.5rem)",
        bgcolor: "background.default",
        px: { xs: 2, md: 4 },
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Stack spacing={3} sx={{ maxWidth: "76rem", mx: "auto" }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h4" fontWeight={800}>
            My Lists
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Keep track of what you have read and what you want to pick up next.
          </Typography>
        </Paper>

        <BooksList
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <LuBookCheck size="1.3rem" />
              <Typography variant="h6" fontWeight={800}>My read list</Typography>
            </Stack>
          }
          booksList={readlistBooks}
          loading={isReadlistLoading}
          listType="read"
        />
        <BooksList
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <BsBookmark size="1.3rem" />
              <Typography variant="h6" fontWeight={800}>My wish list</Typography>
            </Stack>
          }
          booksList={wishlistBooks}
          loading={isWishlistLoading}
          listType="wish"
        />
      </Stack>
    </Box>
  );
};

export default MyLists;
