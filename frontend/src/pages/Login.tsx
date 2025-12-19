import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import loginIcon from "../assets/login-icon.png";
import { FcGoogle } from "react-icons/fc";
import { Controller, useForm } from "react-hook-form";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ILoginForm {
  username: string;
  password: string;
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = () => {
    login();
    navigate("/homePage");
  };

  const handleSignup = () => {
    navigate("/register");
  };

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ILoginForm>({
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = (data: ILoginForm) => {
    console.log("Form data:", data);
    reset();
  };

  return (
    <Box display="flex" marginTop={"5rem"} marginLeft={"4rem"}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box flex={1} display="flex" marginLeft={"8rem"}>
          <div>
            <div style={{ justifySelf: "start", gap: "2rem", display: "grid" }}>
              <Typography variant="h4">Welcome to BookNook</Typography>
              <Button
                style={{ width: "23rem", display: "flex" }}
                variant="outlined"
                startIcon={<FcGoogle />}
              >
                Log in with Google
              </Button>
              <Divider>or</Divider>
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
                <Typography style={{ justifySelf: "start" }}>
                  Username
                </Typography>
                <Controller
                  name="username"
                  control={control}
                  rules={{
                    required: "Username is required",
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      helperText={errors.username?.message}
                      error={!!errors.username}
                      style={{ width: "23rem" }}
                      placeholder="Enter your username"
                    />
                  )}
                />
              </div>
              <div
                style={{
                  gap: "1rem",
                  marginTop: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <Typography style={{ justifySelf: "start" }}>
                  Password
                </Typography>
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: "Password is required",
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type={showPassword ? "text" : "password"}
                      helperText={errors.password?.message}
                      error={!!errors.password}
                      style={{ width: "23rem" }}
                      placeholder="Enter your password"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <IconButton
                              onClick={() => setShowPassword((prev) => !prev)}
                              edge="end"
                              sx={{
                                outline: "none",
                                border: "none",
                                "&:focus": { outline: "none" },
                              }}
                            >
                              {showPassword ? (
                                <BsEyeSlashFill />
                              ) : (
                                <BsEyeFill />
                              )}
                            </IconButton>
                          ),
                        },
                      }}
                    />
                  )}
                />
              </div>
              <Button
                style={{
                  width: "18rem",
                  marginTop: "2rem",
                  justifySelf: "center",
                  display: "flex",
                }}
                type="submit"
              >
                Log in
              </Button>
            </div>
          </div>
        </Box>
      </form>
      <Box
        flex={1}
        marginRight={"2em"}
        marginTop={"1rem"}
        justifyItems={"center"}
        display={"grid"}
      >
        <img src={loginIcon} style={{ width: "50%", height: "90%" }} />
        <Typography
          variant="body2"
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Don't have an account?
          <div
            onClick={handleSignup}
            style={{
              color: "blue",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Sign up
          </div>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
