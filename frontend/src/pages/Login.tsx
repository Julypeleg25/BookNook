import { useState } from "react";
import { Box, Button, TextField, Typography, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
import loginIcon from "../assets/login.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const { login, register } = useUserStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) {
        await register(name, email, password);
        setIsRegister(false);
      } else {
        await login(email, password);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(isRegister ? "Registration failed" : "Login failed");
    }
  };

  return (
    <Box display="flex">
      <Box flex={1} display="flex" margin={"2rem"}>
        <div style={{ width: "100%" }}>
          <h3>Welcome to BookNook</h3>
          <Typography variant="body2">Please Enter your details</Typography>
          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginTop: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <Typography>Name</Typography>
                <TextField
                  placeholder="enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginTop: "1rem",
                marginBottom: "1rem",
              }}
            >
              <Typography>Email</Typography>
              <TextField
                type="email"
                placeholder="enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
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
              <Typography>Password</Typography>
              <TextField
                type="password"
                placeholder="enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <Alert severity="error">{error}</Alert>}
            <Button type="submit" color="success" variant="contained">
              {isRegister ? "Register" : "Login"}
            </Button>
          </form>
          <Typography variant="body2" sx={{ mt: 2 }}>
            {isRegister ? (
              <>
                Already have an account?{" "}
                <Button onClick={() => setIsRegister(false)}>Login</Button>
              </>
            ) : (
              <>
                New to BookNook?{" "}
                <Button onClick={() => setIsRegister(true)}>Register</Button>
              </>
            )}
          </Typography>
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
