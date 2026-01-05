import { Controller, type Control } from "react-hook-form";
import { TextField } from "@mui/material";

export default function NameField({ control }: { control: Control<any> }) {
  return (
    <Controller
      name="name"
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          label="Full name"
          fullWidth
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
      )}
    />
  );
}
