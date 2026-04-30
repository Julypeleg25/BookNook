import { Box, AppBar as MuiAppBar, Toolbar } from "@mui/material";
import bookNookLogo from "@assets/booknook.png";
import { Navigate, Outlet } from "react-router-dom";
import useUserStore from "@/state/useUserStore";

const PublicLayout = () => {
  const { isAuthenticated } = useUserStore();

  if (isAuthenticated) {
    return <Navigate to="/posts" replace />;
  }

  return (
    <Box>
      <MuiAppBar position="sticky" sx={{ top: 0, width: "100%" }}>
        <Toolbar sx={{ height: "4.5rem", display: "flex", width: "100%" }}>
          <Box display="flex" alignItems="center" flexGrow={1}>
            <Box
              component="img"
              src={bookNookLogo}
              alt="BookNook"
              sx={{ height: "2.5rem" }}
            />
          </Box>
        </Toolbar>
      </MuiAppBar>
      <Outlet />
    </Box>
  );
};

export default PublicLayout;
