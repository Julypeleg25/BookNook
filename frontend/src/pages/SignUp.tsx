import {
  Box,
  Button,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import loginIcon from "@assets/login-icon.png";
import { FcGoogle } from "react-icons/fc";
import { Controller, useForm } from "react-hook-form";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterRequestDTO } from "@shared/dtos/auth.dto";
import { useAuth } from "@/hooks/useAuth";
import { RegisterSchema } from "@shared/schemas/auth.schema";
import env from "@/config/env";

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
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
      name: "",
      email: "",
    },
    resolver: zodResolver(RegisterSchema),
    mode: "onSubmit",
  });

  const handleLogin = () => navigate("/login");

  const registerWithGoogle = () => {
    // await AuthService.googleRegister();
    window.location.href = `${env.API_BASE_URL}/google`;
  };

  const onSubmit = async (data: RegisterRequestDTO) => {
    try {
      await register(data);
      reset();
    } catch (error) {
      setError("root", { message: "Invalid username or password" });
    }
  };

  return (
    <Box display="flex" marginTop={"5rem"} marginLeft={"4rem"}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box flex={1} display="flex" marginLeft={"8rem"}>
          <div>
            <div style={{ justifySelf: "start", gap: "2rem", display: "grid" }}>
              <Typography variant="h4">Sign up now</Typography>
              <Button
                onClick={registerWithGoogle}
                style={{ width: "23rem", display: "flex" }}
                variant="outlined"
                startIcon={<FcGoogle />}
              >
                Sign up with Google
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
                <Typography style={{ justifySelf: "start" }}>Name</Typography>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      helperText={errors.name?.message}
                      error={!!errors.name}
                      style={{ width: "23rem" }}
                      placeholder="Enter your name"
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
              {errors.root && (
                <Typography
                  color="error"
                  textAlign="center"
                  sx={{ mb: "1rem" }}
                >
                  {errors.root.message}
                </Typography>
              )}
              <Button
                style={{
                  width: "18rem",
                  marginTop: "2rem",
                  justifySelf: "center",
                  display: "flex",
                }}
                type="submit"
              >
                Sign up
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
          Already have an account?
          <div
            onClick={handleLogin}
            style={{
              color: "blue",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Log in
          </div>
        </Typography>
      </Box>
    </Box>
  );
};

export default SignUp;
