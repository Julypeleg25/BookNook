import { Chip, Stack } from "@mui/material";
import { POPULAR_GENRES } from "@/constants/genres";

interface GenreChipsProps {
  selectedGenre: string;
  onToggleGenre: (genre: string) => void;
}

const GenreChips = ({ selectedGenre, onToggleGenre }: GenreChipsProps) => {
  return (
    <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1, flexWrap: "wrap", gap: 1 }}>
      {POPULAR_GENRES.map((g) => (
        <Chip
          key={g}
          label={g}
          onClick={() => onToggleGenre(g)}
          color={selectedGenre === g ? "primary" : "default"}
          variant={selectedGenre === g ? "filled" : "outlined"}
        />
      ))}
    </Stack>
  );
};

export default GenreChips;
