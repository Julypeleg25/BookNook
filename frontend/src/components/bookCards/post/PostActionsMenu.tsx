import { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  SxProps,
  Theme,
} from "@mui/material";
import { FiEdit, FiMoreVertical, FiBookOpen } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import type { BookPost } from "@models/Book";
import { usePostActions } from "@/hooks/usePostActions";
import DeleteModal from "../../common/DeleteModal";
import useUserStore from "@/state/useUserStore";
import { BsEye } from "react-icons/bs";
import { getBookId } from "@/utils/bookUtils";

interface PostActionsMenuProps {
  post: BookPost;
  edge?: "start" | "end" | false;
  sx?: SxProps<Theme>;
  variant?: "glass" | "standard";
}

const PostActionsMenu = ({ post, edge = "end", sx, variant = "standard" }: PostActionsMenuProps) => {
  const { user } = useUserStore();
  const location = useLocation();
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

  const isGlass = variant === "glass";

  return (
    <>
      <IconButton
        aria-label="settings"
        onClick={handleOpen}
        edge={edge}
        sx={{
          color: isGlass ? "#fff" : "text.secondary",
          p: 0.75,
          transition: "all 0.2s ease",
          ...(isGlass && {
            bgcolor: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "12px",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.25)",
              transform: "scale(1.1)",
              color: "#fff",
            },
          }),
          ...(!isGlass && {
            "&:hover": { color: "primary.main", transform: "scale(1.1)" },
          }),
          ...sx,
        }}
      >
        <FiMoreVertical size={20} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        disableScrollLock
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        onClick={(e) => e.stopPropagation()}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              minWidth: 180,
              boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
              border: "1px solid",
              borderColor: "divider",
            }
          }
        }}
      >
        <MenuItem
          component={Link}
          to={`/posts/${post.id}`}
          state={{ from: location }}
          onClick={handleClose}
        >
          <ListItemIcon>
            <BsEye size={18} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>View Post</ListItemText>
        </MenuItem>
        <MenuItem
          component={Link}
          to={`/post/edit/${post.id}`}
          state={{ from: location }}
          onClick={handleClose}
        >
          <ListItemIcon>
            <FiEdit size={18} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={onDeleteClick} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <MdDelete size={20} color="inherit" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Delete</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          to={`/books/${getBookId(post.book)}`}
          state={{ from: location }}
        >
          <ListItemIcon>
            <FiBookOpen size={18} color="inherit" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>View Book Details</ListItemText>
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
