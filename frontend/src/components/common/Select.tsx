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
  const value = props.multiple
    ? props.selectedValues
    : props.selectedValues[0] ?? "";

  return (
    <FormControl style={props.style} fullWidth={props.fullWidth} sx={props.sx}>
      {props.label && <InputLabel>{props.label}</InputLabel>}
      <MuiSelect
        onChange={(event) => {
          const selectedValue = event.target.value;
          props.onChange(
            props.multiple
              ? typeof selectedValue === "string"
                ? selectedValue.split(",")
                : (selectedValue as (string | number)[])
              : [selectedValue as string | number],
          );
        }}
        startAdornment={props.startIcon}
        variant="outlined"
        fullWidth
        multiple={props.multiple}
        value={value}
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
