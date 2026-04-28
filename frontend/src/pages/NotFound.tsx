import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={"1rem"}
    >
      <Typography variant="h4">Page not found</Typography>
      <Button variant="contained" onClick={() => navigate("/login")}>
        Go to Login
      </Button>
    </Box>
  );
};

export default NotFound;
