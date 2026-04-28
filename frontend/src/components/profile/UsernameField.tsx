import { Controller, type Control } from "react-hook-form";
import { TextField } from "@mui/material";
import type { ProfileFormValues } from "@/models/ProfileForm";
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "@shared/constants/validation";

interface UsernameFieldProps {
  control: Control<ProfileFormValues>;
  disabled?: boolean;
}

const USERNAME_PATTERN = /^[\p{L}\p{N}_]+$/u;

const UsernameField = ({ control, disabled = false }: UsernameFieldProps) => {
  return (
    <Controller
      name="username"
      control={control}
      rules={{
        validate: (value) => {
          const username = value.trim();
          if (!username) return "Username is required";
          if (username.length < USERNAME_MIN_LENGTH) {
            return `Username must be at least ${USERNAME_MIN_LENGTH} characters`;
          }
          if (username.length > USERNAME_MAX_LENGTH) {
            return `Username must be at most ${USERNAME_MAX_LENGTH} characters`;
          }
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
          helperText={
            fieldState.error?.message ??
            `${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters. Letters, numbers, and underscores only.`
          }
          onChange={(event) => field.onChange(event.target.value)}
        />
      )}
    />
  );
};

export default UsernameField;
