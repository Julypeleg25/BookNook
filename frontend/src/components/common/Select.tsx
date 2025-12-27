import {
  FormControl,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
  type SxProps,
} from "@mui/material";
import type { CSSProperties, ReactNode } from "react";

interface MenuItem {
  value: string | number;
  label: string;
}

interface SelectProps {
  menuItems: MenuItem[];
  label?: string;
  selectedValues: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  style?: CSSProperties;
  multiple?: boolean;
  startIcon?: ReactNode;
  sx?: SxProps;
}

const Select = (props: SelectProps) => {
  return (
    <FormControl style={props.style}>
      <InputLabel style={{ gap: "3rem" }}>{props.label}</InputLabel>
      <MuiSelect
        inputProps={{ style: { gap: "1rem" } }}
        startAdornment={props.startIcon}
        variant="standard"
        disableUnderline
        multiple={props.multiple}
        value={props.selectedValues}
        label={props.label}
        sx={props.sx}
      >
        {props.menuItems.map((item) => (
          <MenuItem key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
};
export default Select;
