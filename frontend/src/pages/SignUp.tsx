import {
  Button,
  Typography,
  Stack,
  CircularProgress,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { RegisterSchema } from "@shared/schemas/auth.schema";
import { ApiError } from "@/api/apiError";
import ImageUpload from "@/components/common/ImageUpload";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import AuthTextField from "@/components/auth/AuthTextField";
import PasswordVisibilityButton from "@/components/auth/PasswordVisibilityButton";

interface RegisterFormValues {
  username: string;
  password: string;
  email: string;
  avatar?: File | null;
}

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
    <AuthPageLayout
      footerLabel="Already have an account?"
      footerLinkLabel="Log in"
      onFooterClick={() => navigate("/login")}
    >
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
          <Controller
            name="avatar"
            control={control}
            render={({ field }) => (
              <ImageUpload
                value={field.value ?? null}
                onChange={field.onChange}
                onRemove={() => field.onChange(null)}
                disabled={loading}
                compactActions
              />
            )}
          />

          <AuthTextField
            control={control}
            error={errors.username?.message}
            label="Username"
            name="username"
            placeholder="Choose a username"
          />

          <AuthTextField
            control={control}
            error={errors.email?.message}
            label="Email"
            name="email"
            placeholder="you@example.com"
          />

          <AuthTextField
            control={control}
            error={errors.password?.message}
            label="Password"
            name="password"
            placeholder="Create a password"
            type={showPassword ? "text" : "password"}
            endAdornment={
              <PasswordVisibilityButton
                showPassword={showPassword}
                onToggle={() => setShowPassword((prev) => !prev)}
              />
            }
          />
        </Stack>

        {errors.root && (
          <Typography color="error" variant="body2" textAlign="center">
            {errors.root.message}
          </Typography>
        )}

        <Button
          sx={{
            width: "18rem",
            marginTop: "2rem",
            alignSelf: "center",
          }}
          disabled={loading}
          variant="outlined"
          type="submit"
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Sign up"}
        </Button>

      </Stack>
    </AuthPageLayout>
  );
};

export default SignUp;
