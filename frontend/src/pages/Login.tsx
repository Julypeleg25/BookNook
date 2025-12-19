import { Box, Button, TextField, Typography } from "@mui/material";
import loginIcon from "../assets/login.jpg";

const Login = () => {
  return (
    <Box display="flex">
      <Box flex={1} display="flex" margin={"2rem"}>
        <div style={{}}>
          <h3>Welcome to BookNook</h3>
          <Typography variant="body2">Please Enter your details</Typography>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginTop: "1rem",
              marginBottom: "1rem",
            }}
          >
            <Typography>username</Typography>
            <TextField placeholder="enter your username"></TextField>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginTop: "1rem",
              marginBottom: "1rem",
            }}
          >
            {" "}
            <Typography>password</Typography>
            <TextField placeholder="enter your password"></TextField>
          </div>

          <Typography variant="body2">
            new to BookNook? <a href="/register">Register</a>
          </Typography>
          <Button color="success" variant="contained">
            Login
          </Button>
          <br />
          <br />
          <Button
            variant="outlined"
            onClick={() =>
              (window.location.href = "http://localhost:3000/google")
            }
          >
            Login with Google
          </Button>
        </div>
      </Box>
      <Box flex={1} bgcolor={"white"}>
        <img src={loginIcon} style={{ width: "70%", height: "70%" }} />
      </Box>
    </Box>
  );
};

export default Login;
