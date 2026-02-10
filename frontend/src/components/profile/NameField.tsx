import { Controller, type Control, type FieldValues } from "react-hook-form";
import { TextField } from "@mui/material";

const NameField = ({ control }: { control: Control<FieldValues> }) => {
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
};

export default NameField;
