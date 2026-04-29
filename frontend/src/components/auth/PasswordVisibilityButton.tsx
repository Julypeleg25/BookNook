import { IconButton } from "@mui/material";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";

interface PasswordVisibilityButtonProps {
  showPassword: boolean;
  onToggle: () => void;
}

const PasswordVisibilityButton = ({
  showPassword,
  onToggle,
}: PasswordVisibilityButtonProps) => (
  <IconButton
    onClick={onToggle}
    edge="end"
    sx={{
      outline: "none",
      border: "none",
      "&:focus": { outline: "none" },
    }}
  >
    {showPassword ? <BsEyeSlashFill /> : <BsEyeFill />}
  </IconButton>
);

export default PasswordVisibilityButton;
