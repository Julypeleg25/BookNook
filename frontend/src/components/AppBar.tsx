import {
  Avatar,
  Box,
  IconButton,
  AppBar as MuiAppBar,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import bookNookLogo from "../assets/booknook.png";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { BiUser } from "react-icons/bi";

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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <MuiAppBar position="sticky" style={{ top: 0 }}>
      <Toolbar style={{ height: "4.5rem", display: "flex" }}>
        <Box display="flex" alignItems="center" flexGrow={1}>
          <img src={bookNookLogo} alt="BookNook" style={{ height: "2.5rem" }} />
          {isAuthenticated && (
            <div
              style={{
                marginLeft: "6rem",
                display: "flex",
                gap: "2rem",
                alignSelf: "end",
              }}
            >
              <Typography component={NavLink} to="/booksPosts" sx={navItemSx}>
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
            </div>
          )}
        </Box>
        {isAuthenticated && (
          <Tooltip title="Profile page">
            <IconButton onClick={() => navigate("/profile")} color="inherit">
              <Avatar sx={{ width: "2rem", height: "2rem" }}>
                <BiUser />
              </Avatar>
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
