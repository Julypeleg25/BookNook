import { Button, TextField, Typography } from "@mui/material";
import loginIcon from "../assets/login.jpg";

const Login = () => {
  return (
    <div>
      <h6 style={{ justifySelf: "start", left: 0 }}>Welcome to BookNook</h6>
      <h6>Get Started in a journey of reading</h6>
      <Button />
      <Typography>Login here!</Typography>
      <Typography>username</Typography>
      <TextField placeholder="enter your username"></TextField>
      <Typography>password</Typography>
      <TextField placeholder="enter your password"></TextField>
      <img
        src={loginIcon}
        alt="Login Icon"
        width={"400rem"}
        style={{ justifySelf: "end" }}
      />
      <Typography variant="body2">
        New to BookNook? <a href="/register">Register</a>
      </Typography>
      <Button color="success" variant="contained">
        hello
      </Button>
    </div>
  );
};

export default Login;
