import { Controller, type Control } from "react-hook-form";
import { TextField } from "@mui/material";
import type { ProfileFormValues } from "@/models/ProfileForm";

interface UsernameFieldProps {
  control: Control<ProfileFormValues>;
}

const UsernameField = ({ control }: UsernameFieldProps) => {
  return (
    <Controller
      name="username"
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          label="Username"
          fullWidth
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
      )}
    />
  );
};

export default UsernameField;
