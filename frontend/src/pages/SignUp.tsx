import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import loginIcon from "@assets/login-icon.png";
import { Controller, useForm } from "react-hook-form";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import type { RegisterRequestDTO } from "@shared/dtos/auth.dto";
import { useAuth } from "@/hooks/useAuth";
import { RegisterSchema } from "@shared/schemas/auth.schema";
import { ApiError } from "@/api/apiError";

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setError,
  } = useForm<RegisterRequestDTO>({
    defaultValues: {
      username: "",
      password: "",
      email: "",
    },
    resolver: zodResolver(RegisterSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: RegisterRequestDTO) => {
    setLoading(true);
    try {
      await register(data);
      reset();
    } catch (error: unknown) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Invalid details, try again";
      setError("root", { message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        px: "4rem",
      }}
    >
      <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <Stack
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          spacing="1.5rem"
          sx={{ width: "100%", maxWidth: "23rem" }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Sign up now
          </Typography>

          <Stack spacing="1rem">
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: "0.5rem", fontWeight: 600 }}
              >
                Username
              </Typography>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    variant="outlined"
                    placeholder="Choose a username"
                    error={!!errors.username}
                    helperText={errors.username?.message}
                  />
                )}
              />
            </Box>

            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: "0.5rem", fontWeight: 600 }}
              >
                Email
              </Typography>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    variant="outlined"
                    placeholder="you@example.com"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Box>

            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: "0.5rem", fontWeight: 600 }}
              >
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
                    placeholder="Create a password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <BsEyeSlashFill /> : <BsEyeFill />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Box>
          </Stack>

          {errors.root && (
            <Typography color="error" variant="body2" textAlign="center">
              {errors.root.message}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              py: "0.8rem",
              borderRadius: "0.5rem",
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign up"
            )}
          </Button>

          <Typography
            variant="body2"
            sx={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              justifyContent: "center",
              mt: "1.5rem",
            }}
          >
            Already have an account?
            <Box
              component="span"
              onClick={() => navigate("/login")}
              sx={{
                color: "primary.main",
                textDecoration: "underline",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Log in
            </Box>
          </Typography>
        </Stack>
      </Box>
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          component="img"
          src={loginIcon}
          alt="Login Illustration"
          sx={{ width: "100%", maxWidth: "30rem", height: "auto" }}
        />
      </Box>
    </Box>
  );
};

export default SignUp;
