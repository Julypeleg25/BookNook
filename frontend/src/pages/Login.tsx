import {
  Button,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import type { GoogleCredentialResponse } from "@react-oauth/google";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import type { LoginRequestDTO } from "@shared/dtos/auth.dto";
import { LoginSchema } from "@shared/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthService } from "@/api/services/authService";
import useUserStore from "@/state/useUserStore";
import { tokenService } from "@/api/services/tokenService";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import AuthTextField from "@/components/auth/AuthTextField";
import PasswordVisibilityButton from "@/components/auth/PasswordVisibilityButton";

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
    <AuthPageLayout
      footerLabel="Don't have an account?"
      footerLinkLabel="Sign up"
      onFooterClick={handleSignup}
    >
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
          <Stack alignItems="center">
            <GoogleLogin
              shape="circle"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
            />
          </Stack>

          <Divider>or</Divider>

          <AuthTextField
            control={control}
            error={errors.username?.message}
            label="Username"
            name="username"
            placeholder="Enter your username"
          />

          <AuthTextField
            control={control}
            error={errors.password?.message}
            label="Password"
            name="password"
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            endAdornment={
              <PasswordVisibilityButton
                showPassword={showPassword}
                onToggle={() => setShowPassword((prev) => !prev)}
              />
            }
          />
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
    </AuthPageLayout>
  );
};

export default Login;
