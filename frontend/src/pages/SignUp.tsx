import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  CircularProgress,
  Avatar,
} from "@mui/material";
import loginIcon from "@assets/login-icon.png";
import { Controller, useForm } from "react-hook-form";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { RegisterSchema } from "@shared/schemas/auth.schema";
import { ApiError } from "@/api/apiError";

interface RegisterFormValues {
  username: string;
  password: string;
  email: string;
  avatar?: File; // Changed from FileList to File for easier preview handling
}

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setError,
    watch,
  } = useForm<RegisterFormValues>({
    defaultValues: {
      username: "",
      password: "",
      email: "",
      avatar: undefined,
    },
    resolver: zodResolver(RegisterSchema),
    mode: "onSubmit",
  });

  const avatarValue = watch("avatar");
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (!avatarValue) {
      setPreview("");
      return;
    }
    const objectUrl = URL.createObjectURL(avatarValue);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarValue]);

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);

      if (data.avatar) {
        formData.append("avatar", data.avatar);
      }

      await register(formData);
      reset();
      navigate("/posts");
    } catch (error: unknown) {
      const message = error instanceof ApiError ? error.message : "Signup failed";
      setError("root", { message });
    } finally {
      setLoading(false);
    }
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
            Sign up now
          </Typography>

          <Stack spacing="1.5rem">
            <Box sx={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <Avatar src={preview} sx={{ width: "5rem", height: "5rem" }} />
              <Controller
                name="avatar"
                control={control}
                render={({ field: { onChange } }) => (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onChange(file);
                      }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => fileInputRef.current?.click()}
                      sx={{ textTransform: "none", borderRadius: "0.5rem" }}
                    >
                      Change Profile Picture
                    </Button>
                  </>
                )}
              />
            </Box>

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
                    placeholder="Choose a username"
                    error={!!errors.username}
                    helperText={errors.username?.message}
                  />
                )}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: "0.5rem", fontWeight: 600 }}>
                Email
              </Typography>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="you@example.com"
                    error={!!errors.email}
                    helperText={errors.email?.message}
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
                    placeholder="Create a password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
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
            style={{
              width: "18rem",
              marginTop: "2rem",
              justifySelf: "center",
              display: "flex",
            }}
            disabled={loading}
            variant="outlined"
            type="submit"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign up"}
          </Button>

          <Typography variant="body2" textAlign="center">
            Already have an account?{" "}
            <Box
              component="span"
              onClick={() => navigate("/login")}
              sx={{ color: "primary.main", cursor: "pointer", fontWeight: 700, textDecoration: "underline" }}
            >
              Log in
            </Box>
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, display: { xs: "none", md: "flex" }, justifyContent: "center" }}>
        <Box component="img" src={loginIcon} sx={{ width: "100%", maxWidth: "30rem" }} />
      </Box>
    </Box>
  );
};

export default SignUp;
