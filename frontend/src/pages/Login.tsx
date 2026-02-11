import {
  Box,
  Button,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import loginIcon from "@assets/login-icon.png";
import { GoogleLogin } from "@react-oauth/google";
import type { GoogleCredentialResponse } from "@react-oauth/google";
import { Controller, useForm } from "react-hook-form";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import type { LoginRequestDTO } from "@shared/dtos/auth.dto";
import { LoginSchema } from "@shared/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthService } from "@/api/services/authService";
import useUserStore from "@/state/useUserStore";
import { tokenService } from "@/api/services/tokenService";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setUser } = useUserStore();
  const [loginError, setLoginError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setError,
  } = useForm<LoginRequestDTO>({
    defaultValues: {
      username: "",
      password: "",
    },
    resolver: zodResolver(LoginSchema),
    mode: "onSubmit",
  });

  const handleSignup = () => navigate("/register");

  const onSubmit = async (data: LoginRequestDTO) => {
    try {
      await login(data);
      reset();
    } catch {
      setError("root", { message: "Invalid username or password" });
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: GoogleCredentialResponse
  ) => {
    try {
      if (!credentialResponse.credential) {
        setLoginError("Google login failed — no credential received");
        return;
      }

      const data = await AuthService.googleSignIn(credentialResponse.credential);
      tokenService.setAccess(data.accessToken);
      setUser(data.user);
      navigate("/posts");
    } catch {
      setLoginError("Google login failed");
    }
  };

  const handleGoogleFailure = () => {
    setLoginError("Google login failed");
  };

  return (
    <Box display="flex" marginTop={"5rem"} marginLeft={"4rem"}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box flex={1} display="flex" marginLeft={"8rem"}>
          <div>
            <div style={{ justifySelf: "start", gap: "2rem", display: "grid" }}>
              <Typography variant="h4">Welcome to BookNook</Typography>
              <GoogleLogin
                shape="circle"
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
              />
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
              {(errors.root || loginError) && (
                <Typography
                  color="error"
                  textAlign="center"
                  sx={{ mb: "1rem" }}
                >
                  {errors.root?.message || loginError}
                </Typography>
              )}
              <Button
                style={{
                  width: "18rem",
                  marginTop: "2rem",
                  justifySelf: "center",
                  display: "flex",
                }}
                variant="outlined"
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
        <Box>
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
          </Typography>

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
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
