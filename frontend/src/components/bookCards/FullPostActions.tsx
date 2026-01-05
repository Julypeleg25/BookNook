import { Stack, Button } from "@mui/material";
import { BsEye } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { Link } from "react-router-dom";

interface FullPostActionsProps {
  postId: string;
  setIsDeleteModalOpen: (isOpen: boolean) => void;
}

const FullPostActions = ({
  postId,
  setIsDeleteModalOpen,
}: FullPostActionsProps) => {
  return (
    <Stack direction="row" spacing="0.5rem">
      <Button
        component={Link}
        to={`/posts/${postId}`}
        size="small"
        variant="outlined"
        startIcon={<BsEye />}
      >
        View
      </Button>
      <Button
        component={Link}
        to={`/post/edit/${postId}`}
        size="small"
        variant="outlined"
        startIcon={<FiEdit />}
      >
        Edit
      </Button>
      <Button
        size="small"
        color="error"
        variant="outlined"
        startIcon={<MdDelete />}
        onClick={() => setIsDeleteModalOpen(true)}
      >
        Delete
      </Button>
    </Stack>
  );
};
export default FullPostActions;
