import { Controller, type Control, type FieldValues } from "react-hook-form";
import { TextField } from "@mui/material";

const UsernameField = ({ control }: { control: Control<FieldValues> }) => {
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
