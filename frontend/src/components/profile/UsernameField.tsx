import { Controller, type Control } from "react-hook-form";
import { TextField } from "@mui/material";
import type { ProfileFormValues } from "@/models/ProfileForm";

interface UsernameFieldProps {
  control: Control<ProfileFormValues>;
  disabled?: boolean;
}

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

const UsernameField = ({ control, disabled = false }: UsernameFieldProps) => {
  return (
    <Controller
      name="username"
      control={control}
      rules={{
        validate: (value) => {
          const username = value.trim();
          if (!username) return "Username is required";
          if (username.length < 2) return "Username must be at least 2 characters";
          if (username.length > 20) return "Username must be at most 20 characters";
          return USERNAME_PATTERN.test(username) || "Use only letters, numbers, and underscores";
        },
      }}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          label="Username"
          placeholder="Choose a public username"
          fullWidth
          disabled={disabled}
          error={!!fieldState.error}
          helperText={fieldState.error?.message ?? "2-20 characters. Letters, numbers, and underscores only."}
          onChange={(event) => field.onChange(event.target.value)}
        />
      )}
    />
  );
};

export default UsernameField;
