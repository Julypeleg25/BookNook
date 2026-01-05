import { Controller, type Control } from "react-hook-form";
import { TextField } from "@mui/material";

export default function UsernameField({ control }: { control: Control<any> }) {
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
}
