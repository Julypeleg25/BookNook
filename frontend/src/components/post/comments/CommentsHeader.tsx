import Select from "@/components/common/Select";
import { Box, Chip } from "@mui/material";
import { TbArrowsSort } from "react-icons/tb";
import type { CommentSortOrder } from "@/utils/commentUtils";

interface CommentsHeaderProps {
  length: number;
  sortOrder: CommentSortOrder;
  onSortChange: (value: CommentSortOrder) => void;
}

const CommentsHeader = ({ length, sortOrder, onSortChange }: CommentsHeaderProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: "4rem",
        px: { xs: "1rem", sm: "3rem" },
        gap: "1rem",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          minWidth: 0,
        }}
      >
        <Box sx={{ fontWeight: "bold", fontSize: "1.3rem" }}>Comments</Box>
        <Chip label={length} size={"small"} />
      </Box>
      <Select
        sx={{
          width: "13rem",
          flexShrink: 0,
          "& .MuiInputBase-input": {
            padding: "0.6rem",
          },
        }}
        label=""
        startIcon={<TbArrowsSort size={"2rem"} />}
        onChange={(values) => onSortChange(values[0] as CommentSortOrder)}
        selectedValues={[sortOrder]}
        menuItems={[
          { label: "Most recent", value: "mostRecent" },
          { label: "Least recent", value: "leastRecent" },
        ]}
      />
    </Box>
  );
};

export default CommentsHeader;
