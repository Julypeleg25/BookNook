import { Box, Typography } from "@mui/material";
import type { PropsWithChildren } from "react";

interface FilterFieldProps {
  label: string;
}

const FilterField = ({ label, children }: PropsWithChildren<FilterFieldProps>) => (
  <Box>
    <Typography
      variant="subtitle2"
      sx={{
        mb: 1,
        fontWeight: 600,
        color: "text.secondary",
        textTransform: "uppercase",
        fontSize: "0.75rem",
        letterSpacing: "0.05em",
      }}
    >
      {label}
    </Typography>
    {children}
  </Box>
);

export default FilterField;
