import { Box, Button, TextField, Typography } from "@mui/material";
import loginIcon from "../assets/login-icon.png";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  return (
    <Box display="flex" marginTop={"8rem"}>
      <Box flex={1} display="flex" marginLeft={"10rem"}>
        <div>
          <div style={{ justifySelf: "start", gap: "2rem", display: "grid" }}>
            <Typography variant="h4" fontFamily={"Arial"}>
              Welcome to BookNook
            </Typography>
            <Typography style={{ justifySelf: "start" }} variant="body2">
              Please Enter your details
            </Typography>
          </div>
          <div
            style={{
              gap: "1rem",
              marginTop: "1rem",
              marginBottom: "1rem",
              justifySelf: "start",
            }}
          >
            <div
              style={{
                gap: "1rem",
                marginTop: "1rem",
                marginBottom: "1rem",
              }}
            >
              <Typography style={{ justifySelf: "start" }}>Username</Typography>
              <TextField
                style={{ width: "23rem" }}
                placeholder="Enter your username"
              ></TextField>
            </div>
            <div
              style={{
                gap: "1rem",
                marginTop: "1rem",
                marginBottom: "1rem",
              }}
            >
              <Typography style={{ justifySelf: "start" }}>Password</Typography>
              <TextField
                style={{ width: "23rem" }}
                placeholder="Enter your password"
              ></TextField>
            </div>
            <Button style={{ width: "18rem", marginTop: "2rem", justifySelf:'center', display:'flex' }}>
              Log In
            </Button>
            <Typography
              style={{
                marginTop: "1.6rem",
                display: "flex",
                justifySelf: "center",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              Log in with
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <FaFacebook /> <FcGoogle />
              </div>
            </Typography>
          </div>
        </div>
      </Box>
      <Box flex={1} marginRight={"2em"} marginTop={"1rem"} justifyItems={'center'} display={'grid'}>
        <img src={loginIcon} style={{ width: "70%", height: "80%" }} />
        <Typography variant="body2">
          Don't have an account? <Button href="/register">Sign up</Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
