import { Controller, type Control } from "react-hook-form";
import { TextField } from "@mui/material";

export default function NameField({ control }: { control: Control<any> }) {
  return (
    <Controller
      name="name"
      control={control}
      rules={{
        required: "Name is required",
        minLength: { value: 3, message: "Minimum 3 characters" },
        maxLength: { value: 14, message: "Maximum 14 characters" },
      }}
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
