import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

interface MenuItem {
  value: string | number;
  label: string;
}

interface SearchFiltersSelectProps {
  menuItems: MenuItem[];
  label: string;
  selectedValues: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  style?: React.CSSProperties;
}

const SearchFiltersSelect = (props: SearchFiltersSelectProps) => {
  return (
    <FormControl  style={props.style}>
      <InputLabel id="demo-simple-select-label">{props.label}</InputLabel>
      <Select multiple value={props.selectedValues} label={props.label} >
        {props.menuItems.map((item) => (
          <MenuItem key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
export default SearchFiltersSelect;
