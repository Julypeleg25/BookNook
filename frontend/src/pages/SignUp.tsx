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
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterRequestDTO } from "@shared/dtos/auth.dto";
import { RegisterSchema } from "@shared/schemas/auth.schema";
import { useAuth } from "@/hooks/auth/useAuth";
import env from "@/config/env";
import useAuthForm from "@/hooks/auth/useAuthForm";
import AuthTextField from "@/components/auth/AuthTextField";
import PasswordField from "@/components/auth/PasswordField";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showPassword, togglePassword, loading, setLoading } = useAuthForm();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setError,
  } = useForm<RegisterRequestDTO>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterRequestDTO) => {
    setLoading(true);
    try {
      await register(data);
      reset();
    } catch (error: any) {
      setError("root", {
        message: error?.details?.error || "Invalid details, try again",
      });
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
          <Typography variant="h4" fontWeight={700}>
            Sign up now
          </Typography>

          <GoogleAuthButton
            text="Sign up with Google"
            onClick={() =>
              (window.location.href = `${env.API_BASE_URL}/google`)
            }
          />

          <Divider>
            <Typography variant="body2" color="text.secondary">
              or
            </Typography>
          </Divider>

          <AuthTextField
            name="username"
            label="Username"
            placeholder="Choose a username"
            control={control}
            errors={errors}
          />

          <AuthTextField
            name="email"
            label="Email"
            placeholder="you@example.com"
            control={control}
            errors={errors}
          />

          <PasswordField
            control={control}
            errors={errors}
            showPassword={showPassword}
            togglePassword={togglePassword}
            placeholder="Create a password"
          />

          {errors.root && (
            <Typography color="error" textAlign="center">
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
              fontWeight: 700,
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign up"
            )}
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
          alt="Sign up Illustration"
          sx={{ width: "60%", maxWidth: "25rem", height: "auto" }}
        />

        <Typography variant="body2" color="text.secondary">
          Already have an account?
          <Box
            component="span"
            onClick={() => navigate("/login")}
            sx={{
              ml: "0.3rem",
              color: "primary.main",
              cursor: "pointer",
              fontWeight: 700,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Log in
          </Box>
        </Typography>
      </Box>
    </Box>
  );
};

export default SignUp;
