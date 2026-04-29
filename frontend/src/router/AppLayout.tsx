import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import AppBar from "@/components/AppBar";
import FloatingAddButton from "@/components/common/FloatingAddButton";

const AppLayout = () => {
  return (
    <Box className="app-layout flex min-h-screen">
      <AppBar />
      <Box>
        <Outlet />
      </Box>
      <FloatingAddButton />
    </Box>
  );
};

export default AppLayout;
