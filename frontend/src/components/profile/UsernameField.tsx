import { Controller, type Control } from "react-hook-form";
import { TextField } from "@mui/material";

export default function UsernameField({ control }: { control: Control<any> }) {
  return (
    <Controller
      name="username"
      control={control}
      rules={{
        required: "Username is required",
        minLength: { value: 3, message: "Minimum 3 characters" },
        maxLength: { value: 14, message: "Maximum 14 characters" },
      }}
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
}
