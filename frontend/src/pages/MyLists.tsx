import { axiosClient } from "@/api/axios/axiosClient";
import { endpoints } from "@/api/endpoints";
import useUserStore from "@/state/useUserStore";
import { bookPosts } from "../exampleData";
import BooksList from "@components/lists/BooksList";
import { Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { BsBookmark } from "react-icons/bs";
import { LuBookCheck } from "react-icons/lu";
import { Book } from "@/models/Book";

const MyLists = () => {
  const {
    user: { username },
  } = useUserStore();
  const { data: wishlistBooks = [] } = useQuery({
    queryKey: ["wishlist", "lists", username],
    queryFn: async () => {
      const res = await axiosClient.get<Book[]>(endpoints.lists.wishlist);

      return res.data;
    },
  });

  const { data: readlistBooks = [] } = useQuery({
    queryKey: ["readlist", "lists", username],
    queryFn: async () => {
      const res = await axiosClient.get<Book[]>(endpoints.lists.readlist);

      return res.data;
    },
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
      />
      <BooksList
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <BsBookmark size="1.3rem" /> <h2>My wish list</h2>
          </Stack>
        }
        booksList={wishlistBooks}
      />
    </Stack>
  );
};

export default MyLists;
