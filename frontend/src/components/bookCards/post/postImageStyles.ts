import type { SxProps, Theme } from "@mui/material";

export const POST_CARD_IMAGE_BACKGROUND = "grey.100";

export const POST_CARD_IMAGE_SX = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  bgcolor: POST_CARD_IMAGE_BACKGROUND,
} satisfies SxProps<Theme>;
