import { Box, TextField, Typography } from "@mui/material";
import type React from "react";
import type { Control, FieldPath, FieldValues, PathValue } from "react-hook-form";
import { Controller } from "react-hook-form";

interface AuthTextFieldProps<T extends FieldValues> {
  control: Control<T>;
  error?: string;
  label: string;
  name: FieldPath<T>;
  placeholder: string;
  type?: string;
  endAdornment?: React.ReactNode;
}

const AuthTextField = <T extends FieldValues>({
  control,
  error,
  label,
  name,
  placeholder,
  type,
  endAdornment,
}: AuthTextFieldProps<T>) => (
  <Box>
    <Typography variant="subtitle2" sx={{ mb: "0.5rem", fontWeight: 600 }}>
      {label}
    </Typography>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          value={(field.value ?? "") as PathValue<T, FieldPath<T>>}
          fullWidth
          type={type}
          placeholder={placeholder}
          error={!!error}
          helperText={error}
          slotProps={{
            input: endAdornment
              ? {
                endAdornment,
              }
              : undefined,
          }}
        />
      )}
    />
  </Box>
);

export default AuthTextField;
