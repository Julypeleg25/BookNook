import {
  Box,
  Button,
  Divider,
  Typography,
  Stack,
  CircularProgress,
} from "@mui/material";
import loginIcon from "@assets/login-icon.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginRequestDTO } from "@shared/dtos/auth.dto";
import { LoginSchema } from "@shared/schemas/auth.schema";
import { useAuth } from "@/hooks/auth/useAuth";
import env from "@/config/env";
import useAuthForm from "@/hooks/auth/useAuthForm";
import AuthTextField from "@/components/auth/AuthTextField";
import PasswordField from "@/components/auth/PasswordField";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showPassword, togglePassword, loading, setLoading } = useAuthForm();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setError,
  } = useForm<LoginRequestDTO>({
    defaultValues: { username: "", password: "" },
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginRequestDTO) => {
    setLoading(true);
    try {
      await login(data);
      reset();
    } catch {
      setError("root", { message: "Invalid credentials. Please try again." });
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
          sx={{ width: "100%", maxWidth: "24rem" }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: "0.5rem" }}>
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please enter your details to sign in.
            </Typography>
          </Box>

          <GoogleAuthButton
            text="Log in with Google"
            onClick={() =>
              (window.location.href = `${env.API_BASE_URL}/google`)
            }
          />

          <Divider>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ fontWeight: 700 }}
            >
              OR
            </Typography>
          </Divider>

          <AuthTextField
            name="username"
            label="Username or Email"
            placeholder="Enter your username or email"
            control={control}
            errors={errors}
          />

          <PasswordField
            control={control}
            errors={errors}
            showPassword={showPassword}
            togglePassword={togglePassword}
          />

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
              borderRadius: "0.75rem",
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
            }}
          >
            {loading ? <CircularProgress /> : "Log in"}
          </Button>
        </Stack>
      </Box>
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "grid" },
          justifyItems: "center",
          gap: "1.5rem",
        }}
      >
        <Box
          component="img"
          src={loginIcon}
          alt="Login Illustration"
          sx={{ width: "60%", maxWidth: "25rem", height: "auto" }}
        />

        <Typography variant="body2" color="text.secondary">
          Don't have an account?
          <Box
            component="span"
            onClick={() => navigate("/register")}
            sx={{
              ml: "0.3rem",
              color: "primary.main",
              cursor: "pointer",
              fontWeight: 700,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Sign up
          </Box>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
