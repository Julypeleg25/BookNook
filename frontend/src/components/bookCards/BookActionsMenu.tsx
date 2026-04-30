import {
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
} from "@mui/material";
import { FiMoreVertical, FiBookOpen, FiTrash2 } from "react-icons/fi";
import { TbPencilPlus } from "react-icons/tb";
import type { Book } from "@models/Book";
import { useBookActionsMenu } from "./useBookActionsMenu";

interface BookActionsMenuProps {
    book: Book;
    showWishlistRemove?: boolean;
    edge?: "start" | "end" | false;
}

const BookActionsMenu = ({ book, showWishlistRemove, edge = "end" }: BookActionsMenuProps) => {
    const {
        anchorEl,
        handleClose,
        handleOpen,
        handleRemove,
        handleViewDetails,
        handleWriteReview,
        isPending,
    } = useBookActionsMenu({ book, showWishlistRemove });

    return (
        <>
            <IconButton
                aria-label="settings"
                onClick={handleOpen}
                edge={edge}
                sx={{
                    width: 36,
                    height: 36,
                    p: 0.75,
                    color: "#fff",
                    bgcolor: "rgba(31, 41, 51, 0.55)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.28)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 24px rgba(0, 0, 0, 0.18)",
                    transition: "background-color 0.2s ease, transform 0.2s ease",
                    "&:hover": {
                        bgcolor: "rgba(31, 41, 51, 0.72)",
                        color: "#fff",
                        transform: "scale(1.04)",
                    },
                }}
            >
                <FiMoreVertical size={20} />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                disableScrollLock
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                onClick={(e) => e.stopPropagation()}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: "12px",
                            minWidth: 190,
                            boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                            border: "1px solid",
                            borderColor: "divider",
                            "& .MuiMenuItem-root": {
                                minHeight: 48,
                                py: 1.25,
                                px: 2,
                                gap: 1,
                            },
                            "& .MuiListItemIcon-root": {
                                minWidth: 34,
                                "& svg": {
                                    width: 22,
                                    height: 22,
                                },
                            },
                            "& .MuiListItemText-primary": {
                                fontSize: "0.98rem",
                                fontWeight: 600,
                            },
                        },
                    },
                }}
            >
                <MenuItem onClick={handleViewDetails}>
                    <ListItemIcon>
                        <FiBookOpen fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>View book details</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleWriteReview}>
                    <ListItemIcon>
                        <TbPencilPlus fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Write a review</ListItemText>
                </MenuItem>

                {showWishlistRemove && (
                    <MenuItem onClick={handleRemove} disabled={isPending} sx={{ color: "error.main" }}>
                        <ListItemIcon>
                            {isPending ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : (
                                <FiTrash2 fontSize="small" color="inherit" />
                            )}
                        </ListItemIcon>
                        <ListItemText>Remove from wishlist</ListItemText>
                    </MenuItem>
                )}
            </Menu>
        </>
    );
};

export default BookActionsMenu;
