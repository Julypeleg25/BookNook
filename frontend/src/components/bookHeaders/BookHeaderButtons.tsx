import { ListsService } from "@/api/services/ListsService";
import { userReviewService } from "@/api/services/userReviewService";
import { Button } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BiBookAdd } from "react-icons/bi";
import { BsBook } from "react-icons/bs";
import { LiaBookmark } from "react-icons/lia";
import { LuBookCheck } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

interface BookHeaderProps {
  id: string;
  isBookPost?: boolean;
}

const BookHeader = ({ id, isBookPost }: BookHeaderProps) => {
  const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { mutate: addBookToList } = useMutation({
      mutationFn: (listType: "wish" | "read") =>
        ListsService.addBookToList(id, listType),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lists', id] });
      },
    });

    const handleAddToWishlist = () => {
      addBookToList("wish");
    };

    const handleAddToReadlist = () => {
      addBookToList("read");
    };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "40%",
      }}
    >
      {isBookPost ? (
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/books/${id}`)}
          startIcon={<BsBook />}
        >
          Go to book page
        </Button>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/post/create/${id}`)}
          startIcon={<BiBookAdd />}
        >
          Write a review
        </Button>
      )
      }

      <Button
        variant="contained"
        color="primary"
        onClick={handleAddToWishlist}
        startIcon={<LiaBookmark />}
      >
        Add to my wish list
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddToReadlist}
        startIcon={<LuBookCheck />}
      >
        Add to my read list
      </Button>
    </div >
  );
};
export default BookHeader;
