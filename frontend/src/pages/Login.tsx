import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
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
    <Box sx={{ display: "flex", minHeight: "100vh", alignItems: "center", px: "4rem" }}>
      <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <Stack
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          spacing="1.5rem"
          sx={{ width: "100%", maxWidth: "23rem" }}
        >
          <Typography variant="h4" fontWeight="bold">
            Welcome back
          </Typography>

          <Stack spacing="1.5rem">
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <GoogleLogin
                shape="circle"
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
              />
            </Box>

            <Divider>or</Divider>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: "0.5rem", fontWeight: 600 }}>
                Username
              </Typography>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    helperText={errors.username?.message}
                    error={!!errors.username}
                    placeholder="Enter your username"
                  />
                )}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: "0.5rem", fontWeight: 600 }}>
                Password
              </Typography>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    helperText={errors.password?.message}
                    error={!!errors.password}
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
                            {showPassword ? <BsEyeSlashFill /> : <BsEyeFill />}
                          </IconButton>
                        ),
                      },
                    }}
                  />
                )}
              />
            </Box>
          </Stack>

          {(errors.root || loginError) && (
            <Typography color="error" variant="body2" textAlign="center">
              {errors.root?.message || loginError}
            </Typography>
          )}

          <Button
            sx={{
              width: "18rem",
              marginTop: "2rem",
              alignSelf: "center",
            }}
            variant="outlined"
            type="submit"
          >
            Log in
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "grid",
          justifyItems: "center",
          alignSelf: "center",
          gap: 2,
        }}
      >
        <Box
          component="img"
          src={loginIcon}
          sx={{ display: { xs: "none", md: "block" }, width: "100%", maxWidth: "30rem" }}
        />
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2">Don't have an account?</Typography>

          <Box
            onClick={handleSignup}
            sx={{
              color: "blue",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Sign up
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
