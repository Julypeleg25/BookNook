import { Button, Typography, Box } from "@mui/material";
import { useUserStore } from "../stores/userStore";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch("http://localhost:3000/logout", {
      credentials: "include",
    });
    logout();
    navigate("/login");
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
      <Typography variant="h4">Welcome to Dashboard</Typography>
      {user && (
        <Box mt={2}>
          <Typography>User ID: {user.id}</Typography>
          <Typography>Email: {user.email}</Typography>
        </Box>
      )}
      <Button
        variant="contained"
        color="secondary"
        onClick={handleLogout}
        sx={{ mt: 2 }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Dashboard;
