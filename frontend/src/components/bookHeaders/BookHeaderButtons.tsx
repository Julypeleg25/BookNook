import { ListsService } from "@/api/services/ListsService";
import { Button, Stack } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BiBookAdd } from "react-icons/bi";
import { BsBook } from "react-icons/bs";
import { LiaBookmark } from "react-icons/lia";
import { LuBookCheck } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import useUserStore from "@/state/useUserStore";

interface BookHeaderProps {
  id: string;
  isBookPost?: boolean;
}

const BookHeader = ({ id, isBookPost }: BookHeaderProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const { mutate: addBookToList } = useMutation({
    mutationFn: (listType: "wish" | "read") =>
      ListsService.addBookToList(id, listType),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [variables === "wish" ? "wishlist" : "readlist", "lists", user.username],
      });
      navigate("/lists");
    },
  });

  const handleAddToWishlist = () => {
    addBookToList("wish");
  };

  const handleAddToReadlist = () => {
    addBookToList("read");
  };

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      alignItems={{ xs: "stretch", sm: "center" }}
      justifyContent="flex-end"
      sx={{
        width: { xs: "100%", md: "auto" },
        mt: { xs: 2, md: 0 }
      }}
    >
      {isBookPost ? (
        <Button
          variant="contained"
          onClick={() => navigate(`/books/${id}`)}
          startIcon={<BsBook />}
          sx={{ borderRadius: "2rem", px: 3 }}
        >
          Go to book page
        </Button>
      ) : (
        <Button
          variant="contained"
          onClick={() => navigate(`/post/create/${id}`)}
          startIcon={<BiBookAdd />}
          sx={{ borderRadius: "2rem", px: 3 }}
        >
          Write a review
        </Button>
      )}

      <Button
        variant="outlined"
        onClick={handleAddToWishlist}
        startIcon={<LiaBookmark />}
        sx={{ borderRadius: "2rem", px: 3 }}
      >
        Add to Wishlist
      </Button>
      <Button
        variant="outlined"
        onClick={handleAddToReadlist}
        startIcon={<LuBookCheck />}
        sx={{ borderRadius: "2rem", px: 3 }}
      >
        Add to Read List
      </Button>
    </Stack>
  );
};
export default BookHeader;
