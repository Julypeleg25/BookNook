import useUserStore from "@/state/useUserStore";
import BooksList from "@components/lists/BooksList";
import { Stack } from "@mui/material";
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
    <Stack margin="2rem">
      <BooksList
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <LuBookCheck size="1.3rem" />
            <h2>My read list</h2>
          </Stack>
        }
        booksList={readlistBooks}
        loading={isReadlistLoading}
        listType="read"
      />
      <BooksList
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <BsBookmark size="1.3rem" /> <h2>My wish list</h2>
          </Stack>
        }
        booksList={wishlistBooks}
        loading={isWishlistLoading}
        listType="wish"
      />
    </Stack>
  );
};

export default MyLists;
