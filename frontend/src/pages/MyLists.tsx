import { bookPosts } from "../exampleData";
import BooksList from "../components/lists/BooksList";
import { Stack } from "@mui/material";
import { BsBookmark } from "react-icons/bs";
import { LuBookCheck } from "react-icons/lu";

const exampleUserRead = bookPosts
  .filter((b) => b)
  .map((p) => p.book);
const exampleUserRead2 = bookPosts
  .filter((b) => b.user.id === "u1")
  .map((p) => p.book);

const MyLists = () => {
  return (
    <Stack margin="2rem">
      <BooksList
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <LuBookCheck size="1.3rem"/>
            <h2>My read list</h2>
          </Stack>
        }
        booksList={exampleUserRead}
      />
      <BooksList
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <BsBookmark size="1.3rem" /> <h2>My wish list</h2>
          </Stack>
        }
        booksList={exampleUserRead2}
      />
    </Stack>
  );
};

export default MyLists;
