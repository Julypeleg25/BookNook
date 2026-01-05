import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { HiOutlineUser, HiOutlineLogout } from "react-icons/hi";

interface ProfileMenuProps {
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

const ProfileMenu = ({ onClose, anchorEl }: ProfileMenuProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      disableScrollLock={true}
    >
      <MenuItem
        onClick={() => handleNavigate("/profile")}
        sx={{ py: "0.6rem" }}
      >
        <ListItemIcon sx={{ fontSize: "1.2rem", color: "text.primary" }}>
          <HiOutlineUser />
        </ListItemIcon>
        <ListItemText>Profile</ListItemText>
      </MenuItem>

      <Divider sx={{ my: "0.5rem" }} />

      <MenuItem
        onClick={handleLogout}
        sx={{ py: "0.6rem", color: "error.main" }}
      >
        <ListItemIcon sx={{ fontSize: "1.2rem", color: "error.main" }}>
          <HiOutlineLogout />
        </ListItemIcon>
        <ListItemText>Logout</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default ProfileMenu;
