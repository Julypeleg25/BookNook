import { Button, Typography, Box } from "@mui/material";
import { useUserStore } from "../stores/userStore";

const Dashboard = () => {
  const { user, logout } = useUserStore();

  const handleLogout = async () => {
    await fetch("http://localhost:3000/logout", {
      credentials: "include",
    });
    logout();
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
      <Typography variant="h4">Welcome to Dashboard</Typography>
      {user && (
        <Box mt={2}>
          <Typography>Name: {user.name}</Typography>
          <Typography>Email: {user.email}</Typography>
          <img
            src={user.avatar}
            alt="Avatar"
            style={{ width: 100, height: 100, borderRadius: "50%" }}
          />
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
