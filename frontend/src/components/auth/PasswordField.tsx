import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";

interface PasswordFieldProps {
  control: any;
  errors: any;
  showPassword: boolean;
  togglePassword: () => void;
  label?: string;
  placeholder?: string;
}

const PasswordField = ({
  control,
  errors,
  showPassword,
  togglePassword,
  label = "Password",
  placeholder = "••••••••",
}: PasswordFieldProps) => (
  <Box>
    <Typography sx={{ mb: "0.5rem", fontWeight: 600 }}>{label}</Typography>
    <Controller
      name="password"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          error={!!errors.password}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePassword}>
                    {showPassword ? <BsEyeSlashFill /> : <BsEyeFill />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: "0.75rem" },
          }}
        />
      )}
    />
  </Box>
);

export default PasswordField;
