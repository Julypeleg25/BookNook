import { Box, Button, Modal, Stack, Typography } from "@mui/material";

interface DeleteModalProps {
  confirmDisabled?: boolean;
  confirmLabel?: string;
  isOpen: boolean;
  message?: string;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
}

const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this post?",
  confirmLabel = "Delete",
  confirmDisabled = false,
}: DeleteModalProps) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          p: "1.5rem",
          borderRadius: "1rem",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          display: "grid",
          minWidth: { xs: "calc(100vw - 2rem)", sm: "24rem" },
        }}
      >
        <Typography variant="h6" fontWeight={800}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {message}
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="space-between" sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="error"
            disabled={confirmDisabled}
            variant="contained"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};
export default DeleteModal;
