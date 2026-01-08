import env from "@/config/env";
import useUserStore from "@/state/useUserStore";
import { Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();

  // const handleLogout = async () => {
  //   await fetch(`${env.API_BASE_URL}/logout`, {
  //     credentials: "include",
  //   });
  //   logout();
  //   navigate("/login");
  // };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
      <Typography variant="h4">Welcome to Dashboard</Typography>
      {user && (
        <Box mt={2}>
          <Typography>User ID: {user.id}</Typography>
          {/* <Typography>Email: {user.email}</Typography> */}
        </Box>
      )}
      <Button
        variant="contained"
        color="secondary"
        // onClick={handleLogout}
        // todo logout - on back, clear tokens, and naavigate to login
        sx={{ mt: 2 }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Dashboard;
