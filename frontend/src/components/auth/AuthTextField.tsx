import { Box, Typography, TextField } from "@mui/material";
import { Controller } from "react-hook-form";

interface AuthTextFieldProps {
  name: string;
  label: string;
  placeholder: string;
  control: any;
  errors: any;
}

const AuthTextField = ({
  name,
  label,
  placeholder,
  control,
  errors,
}: AuthTextFieldProps) => (
  <Box>
    <Typography sx={{ mb: "0.5rem", fontWeight: 600 }}>{label}</Typography>
    <Controller
      name={name as any}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          placeholder={placeholder}
          error={!!errors[name]}
          helperText={errors[name]?.message}
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: "0.75rem" },
          }}
        />
      )}
    />
  </Box>
);

export default AuthTextField;
