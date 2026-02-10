import {
  Box,
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
} from "@mui/material";
import bookNookLogo from "@assets/booknook.png";
import { NavLink } from "react-router-dom";
import useUserStore from "@state/useUserStore";
import { getTimeOfDay } from "@utils/dateUtils";
import UserMenu from "./UserMenu";

const navItemSx = {
  position: "relative",
  cursor: "pointer",
  fontWeight: 500,
  color: "inherit",
  textDecoration: "none",
  "&::after": {
    content: '""',
    position: "absolute",
    left: 0,
    marginTop: "2.3rem",
    width: "100%",
    height: "0.1rem",
    backgroundColor: "currentColor",
    transform: "scaleX(0)",
    transformOrigin: "left",
    transition: "transform 0.25s ease",
  },

  "&:hover::after": {
    transform: "scaleX(1)",
  },

  "&.active::after": {
    transform: "scaleX(1)",
  },
};

const AppBar = () => {
  const { user } = useUserStore();

  return (
    <MuiAppBar position="sticky" sx={{ top: 0, width: "100%" }}>
      <Toolbar sx={{ height: "4.5rem", display: "flex", width: "100%" }}>
        <Box display="flex" alignItems="center" flexGrow={1}>
          <img
            src={bookNookLogo}
            alt="BookNook"
            style={{ height: "2.5rem" }}
          />
          <Box
            sx={{
              marginLeft: "6rem",
              display: "flex",
              gap: "2rem",
              alignSelf: "end",
            }}
          >
            <Typography component={NavLink} to="/posts" sx={navItemSx}>
              Posts
            </Typography>
            <Typography component={NavLink} to="/books" sx={navItemSx}>
              Books
            </Typography>
            <Typography component={NavLink} to="/lists" sx={navItemSx}>
              My Lists
            </Typography>

            <Typography component={NavLink} to="/myPosts" sx={navItemSx}>
              My Posts
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          Good {getTimeOfDay()}, {user.username}
          <UserMenu />
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
