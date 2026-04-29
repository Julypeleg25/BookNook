import { type ReactNode, useState } from "react";
import {
  Box,
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
}

const ACTION_BUTTON_SIZE = 36;
const ACTION_ICON_SIZE = 20;
const ACTION_MENU_BORDER_RADIUS = "12px";
const MENU_ITEM_ICON_SIZE = 18;
const DELETE_ICON_SIZE = 20;

const ACTION_BUTTON_SX = {
  width: ACTION_BUTTON_SIZE,
  height: ACTION_BUTTON_SIZE,
  p: 0.75,
  color: "#fff",
  bgcolor: "rgba(31, 41, 51, 0.55)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.28)",
  borderRadius: ACTION_MENU_BORDER_RADIUS,
  boxShadow: "0 10px 24px rgba(0, 0, 0, 0.18)",
  transition: "background-color 0.2s ease, transform 0.2s ease",
  "&:hover": {
    bgcolor: "rgba(31, 41, 51, 0.72)",
    color: "#fff",
    transform: "scale(1.04)",
  },
} satisfies SxProps<Theme>;

const MENU_PAPER_SX = {
  borderRadius: ACTION_MENU_BORDER_RADIUS,
  minWidth: 180,
  boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
  border: "1px solid",
  borderColor: "divider",
} satisfies SxProps<Theme>;

const MENU_OVERLAY_SX = {
  position: "absolute",
  top: 14,
  right: 14,
  zIndex: 2,
} satisfies SxProps<Theme>;

export const PostActionsMenuOverlay = ({
  children,
}: {
  children: ReactNode;
}) => (
  <Box sx={MENU_OVERLAY_SX} onClick={(event) => event.stopPropagation()}>
    {children}
  </Box>
);

const PostActionsMenu = ({ post, edge = "end", sx }: PostActionsMenuProps) => {
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

  return (
    <>
      <IconButton
        aria-label="settings"
        onClick={handleOpen}
        edge={edge}
        sx={{
          ...ACTION_BUTTON_SX,
          ...sx,
        }}
      >
        <FiMoreVertical size={ACTION_ICON_SIZE} />
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
            sx: MENU_PAPER_SX,
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
            <BsEye size={MENU_ITEM_ICON_SIZE} />
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
            <FiEdit size={MENU_ITEM_ICON_SIZE} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={onDeleteClick} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <MdDelete size={DELETE_ICON_SIZE} color="inherit" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Delete</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          to={`/books/${getBookId(post.book)}`}
          state={{ from: location }}
        >
          <ListItemIcon>
            <FiBookOpen size={MENU_ITEM_ICON_SIZE} color="inherit" />
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
