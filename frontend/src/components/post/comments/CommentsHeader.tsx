import Select from "@/components/common/Select";
import { Chip } from "@mui/material";
import { TbArrowsSort } from "react-icons/tb";

interface CommentsHeaderProps {
  length: number;
}

const CommentsHeader = ({ length }: CommentsHeaderProps) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          marginLeft: "3rem",
          alignItems: "center",
          gap: "0.6rem",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "1.3rem" }}>Comments</div>
        <Chip label={length} size={"small"} />
      </div>
      <Select
        sx={{
          "& .MuiInputBase-input": {
            padding: "0.6rem",
          },
        }}
        style={{ marginRight: "2.8rem" }}
        label=""
        startIcon={<TbArrowsSort size={"2rem"} />}
        onChange={() => {}}
        selectedValues={["mostRecent"]}
        menuItems={[
          { label: "Most recent", value: "mostRecent" },
          { label: "Least recent", value: "leastRecent" },
        ]}
      />
    </div>
  );
};

export default CommentsHeader;
