import { Button, Modal } from "@mui/material";

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
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "1rem",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          display: "grid",
        }}
      >
        <h2>{title}</h2>
        <p>{message}</p>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "1.5rem",
            justifyContent: "space-between",
          }}
        >
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
        </div>
      </div>
    </Modal>
  );
};
export default DeleteModal;
