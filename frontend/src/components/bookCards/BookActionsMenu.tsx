import { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import type { Book } from "@models/Book";
import { ListsService } from "@/api/services/ListsService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useUserStore from "@/state/useUserStore";
import { useSnackbar } from "notistack";
import { useProtectedNavigation } from "@/hooks/useProtectedNavigation";

interface BookActionsMenuProps {
    book: Book;
    listType?: "wish" | "read";
    edge?: "start" | "end" | false;
}

const BookActionsMenu = ({ book, listType, edge = "end" }: BookActionsMenuProps) => {
    const { user } = useUserStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { navigateProtected } = useProtectedNavigation();

    const { mutate: removeFromList, isPending } = useMutation({
        mutationFn: () => ListsService.removeBookFromList(book.id, listType!),
        onSuccess: () => {
            const fullListType = listType === "wish" ? "wishlist" : "readlist";
            queryClient.invalidateQueries({ queryKey: [fullListType, "lists", user.username] });
            enqueueSnackbar("Book removed from list", { variant: "success" });
            handleClose();
        },
        onError: () => {
            enqueueSnackbar("Failed to remove book from list", { variant: "error" });
        },
    });

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleRemove = (event: React.MouseEvent) => {
        event.stopPropagation();
        if (listType) {
            removeFromList();
        }
    };

    const handleViewDetails = (event: React.MouseEvent) => {
        event.stopPropagation();
        navigate(`/books/${book.id}`);
        handleClose();
    };

    const handleWriteReview = (event: React.MouseEvent) => {
        event.stopPropagation();
        const didNavigate = navigateProtected(`/post/create/${book.id}`, {
            state: { book }
        });
        if (didNavigate) {
            handleClose();
        }
    };

    return (
        <>
            <IconButton
                aria-label="settings"
                onClick={handleOpen}
                edge={edge}
                sx={{
                    color: "text.secondary",
                    "&:hover": { color: "primary.main" },
                }}
            >
                <FiMoreVertical />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                disableScrollLock
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                onClick={(e) => e.stopPropagation()}
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

                {listType && (
                    <MenuItem onClick={handleRemove} disabled={isPending} sx={{ color: "error.main" }}>
                        <ListItemIcon>
                            {isPending ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : (
                                <FiTrash2 fontSize="small" color="inherit" />
                            )}
                        </ListItemIcon>
                        <ListItemText>Remove from list</ListItemText>
                    </MenuItem>
                )}
            </Menu>
        </>
    );
};

export default BookActionsMenu;
