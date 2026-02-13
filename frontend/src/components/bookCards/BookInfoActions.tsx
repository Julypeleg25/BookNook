import { Tooltip, IconButton } from "@mui/material";
import { BiBookmark } from "react-icons/bi";
import { LuBookCheck } from "react-icons/lu";
import { MdAddComment, MdEdit } from "react-icons/md";
import { TbPencilPlus } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

const BookInfoActions = () => {
      const navigate = useNavigate();

  return (
    <div style={{ display: "flex", gap: "1.6rem" }}>
      <Tooltip title="Add to wish list">
        <IconButton size="small">
          <BiBookmark size={'1.2rem'} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Write a review">
        <IconButton size="small">
          <TbPencilPlus size={'1.3rem'} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Add to read list">
        <IconButton size="small">
          <LuBookCheck size={'1.2rem'}/>
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default BookInfoActions;
