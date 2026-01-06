import { Button } from "@mui/material";
import { FcGoogle } from "react-icons/fc";

interface GoogleAuthButtonProps {
  text: string;
  onClick: () => void;
}

const GoogleAuthButton = ({ text, onClick }: GoogleAuthButtonProps) => (
  <Button
    fullWidth
    variant="outlined"
    size="large"
    onClick={onClick}
    startIcon={<FcGoogle />}
    sx={{
      textTransform: "none",
      borderRadius: "0.75rem",
      fontWeight: 600,
      py: "0.7rem",
    }}
  >
    {text}
  </Button>
);

export default GoogleAuthButton;
