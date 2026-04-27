import { Tooltip, IconButton } from "@mui/material";
import React from "react";
import { BiBookmark } from "react-icons/bi";
import { LuBookCheck } from "react-icons/lu";
import { TbPencilPlus } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

interface BookInfoActionsProps {
  bookId: string;
}

const BookInfoActions = ({ bookId }: BookInfoActionsProps) => {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", gap: "1.6rem" }}>
      <Tooltip title="add to wish list">
        <IconButton size="small">
          <BiBookmark size={"1.2rem"} />
        </IconButton>
      </Tooltip>
      <Tooltip title="write a review">
        <IconButton size="small" onClick={() => navigate(`/post/create/${bookId}`)}>
          <TbPencilPlus size={"1.3rem"} />
        </IconButton>
      </Tooltip>
      <Tooltip title="add to read list">
        <IconButton size="small">
          <LuBookCheck size={"1.2rem"} />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default React.memo(BookInfoActions);
