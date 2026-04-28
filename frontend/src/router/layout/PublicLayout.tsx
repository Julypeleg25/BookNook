import { Box, AppBar as MuiAppBar, Toolbar } from "@mui/material";
import bookNookLogo from "@assets/booknook.png";
import { Navigate, Outlet } from "react-router-dom";
import useUserStore from "@/state/useUserStore";
import { DEFAULT_AUTH_REDIRECT } from "@/utils/redirects";

const PublicLayout = () => {
  const { isAuthenticated } = useUserStore();

  if (isAuthenticated) {
    return <Navigate to={DEFAULT_AUTH_REDIRECT} replace />;
  }

  return (
    <div>
      <MuiAppBar position="sticky" style={{ top: 0, width: "100%" }}>
        <Toolbar style={{ height: "4.5rem", display: "flex", width: "100%" }}>
          <Box display="flex" alignItems="center" flexGrow={1}>
            <img
              src={bookNookLogo}
              alt="BookNook"
              style={{ height: "2.5rem" }}
            />
          </Box>
        </Toolbar>
      </MuiAppBar>
      <Outlet />
    </div>
  );
};

export default PublicLayout;
