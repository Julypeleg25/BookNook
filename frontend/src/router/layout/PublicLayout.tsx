import { Box, AppBar as MuiAppBar, Toolbar } from "@mui/material";
import bookNookLogo from "@assets/booknook.png";
import Login from "@/pages/Login";
import { Outlet } from "react-router-dom";

const PublicLayout = () => {
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
      <Outlet/>
    </div>
  );
};

export default PublicLayout;
