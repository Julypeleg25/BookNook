import { Box, AppBar as MuiAppBar, Toolbar, Typography } from "@mui/material";
import bookNookLogo from "../assets/booknook.png";

const AppBar = () => {
  return (
    <MuiAppBar position="static">
      <Toolbar>
        <Box display="flex" alignItems="center">
          <img src={bookNookLogo} alt="BookNook" style={{ height: '2.5rem' }} />
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
