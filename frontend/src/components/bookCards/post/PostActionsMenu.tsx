import { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { FiEdit, FiMoreVertical, FiBookOpen } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { Link } from "react-router-dom";
import type { BookPost } from "@models/Book";
import { usePostActions } from "@/hooks/usePostActions";
import DeleteModal from "../../common/DeleteModal";
import useUserStore from "@/state/useUserStore";
import { BsEye } from "react-icons/bs";

interface PostActionsMenuProps {
  post: BookPost;
  edge?: "start" | "end" | false;
}

const PostActionsMenu = ({ post, edge = "end" }: PostActionsMenuProps) => {
  const { user } = useUserStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { isDeleteModalOpen, setIsDeleteModalOpen, handleDeleteConfirm } =
    usePostActions();

  const isOwner = user?.username === post.user.username;

  if (!isOwner) return null;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDeleteModalOpen(true);
    handleClose();
  };

  return (
    <>
      <IconButton
        aria-label="settings"
        onClick={handleOpen}
        edge={edge}
        sx={{
          color: "text.secondary",
          "&:hover": { color: "primary.main" },
        }}
      >
        <FiMoreVertical />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        onClick={(e) => e.stopPropagation()}
      >
           <MenuItem
          component={Link}
          to={`/posts/${post.id}`}
          onClick={handleClose}
        >
          <ListItemIcon>
            <BsEye fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Post</ListItemText>
        </MenuItem>
        <MenuItem
          component={Link}
          to={`/post/edit/${post.id}`}
          onClick={handleClose}
        >
          <ListItemIcon>
            <FiEdit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={onDeleteClick} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <MdDelete fontSize="small" color="inherit" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>

         <MenuItem component={Link}
          to={`/books/${post.book.id}`} >
          <ListItemIcon>
            <FiBookOpen fontSize="small" color="inherit" />
          </ListItemIcon>
          <ListItemText>View Book Details</ListItemText>
        </MenuItem>
      </Menu>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleDeleteConfirm(post.id)}
      />
    </>
  );
};

export default PostActionsMenu;
