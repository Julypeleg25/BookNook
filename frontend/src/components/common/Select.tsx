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
  fullWidth?: boolean;
}

const Select = (props: SelectProps) => {
  return (
    <FormControl style={props.style} fullWidth={props.fullWidth} sx={props.sx}>
      {props.label && <InputLabel>{props.label}</InputLabel>}
      <MuiSelect
        onChange={(event) => {
          const value = event.target.value;
          props.onChange(typeof value === 'string' ? value.split(',') : (value as (string | number)[]));
        }}
        startAdornment={props.startIcon}
        variant="outlined"
        fullWidth
        multiple={props.multiple}
        value={props.selectedValues}
        label={props.label}
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