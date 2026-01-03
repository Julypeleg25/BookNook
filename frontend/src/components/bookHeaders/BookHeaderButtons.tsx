import { Button } from "@mui/material";
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
          onClick={() => navigate(`/post`)}
          startIcon={<BiBookAdd />}
        >
          Write a review
        </Button>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate(`/books/${id}`)}
        startIcon={<LiaBookmark />}
      >
        Add to my wish list
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate(`/books/${id}`)}
        startIcon={<LuBookCheck />}
      >
        Add to my read list
      </Button>
    </div>
  );
};
export default BookHeader;
