import { ToggleButton, ToggleButtonGroup } from "@mui/material";

interface SearchFiltersToggleButtonGroupProps {
  options: { value: string; label: string }[];
  selectedValue?: string;
  onChange: (event: React.MouseEvent<HTMLElement>, value: any) => void;
  style?: React.CSSProperties;
}

const SearchFiltersToggleButtonGroup = (
  props: SearchFiltersToggleButtonGroupProps
) => {
  return (
    <ToggleButtonGroup
      style={props.style}
      exclusive
      value={props.selectedValue}
      onChange={props.onChange}
    >
      {props.options.map((option) => (
        <ToggleButton value={option.value}>{option.label}</ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default SearchFiltersToggleButtonGroup;
