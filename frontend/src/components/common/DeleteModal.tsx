import { Button, Modal } from "@mui/material";

const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
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
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete this post?</p>
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
          <Button variant="contained" color="error" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export default DeleteModal;
