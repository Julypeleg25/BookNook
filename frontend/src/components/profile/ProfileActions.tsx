import { Button, Stack } from "@mui/material";
import { BsBookmark } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";

interface ProfileActionsProps {
  onCreatePost: () => void;
  onViewWishlist: () => void;
}

export const ProfileActions = ({
  onCreatePost,
  onViewWishlist,
}: ProfileActionsProps) => (
  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
    <Button startIcon={<FiPlus />} onClick={onCreatePost}>
      Create Post
    </Button>
    <Button
      variant="outlined"
      startIcon={<BsBookmark />}
      onClick={onViewWishlist}
    >
      View Wishlist
    </Button>
  </Stack>
);
