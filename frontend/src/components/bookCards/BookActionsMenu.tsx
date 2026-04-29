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
import { getBookId } from "@/utils/bookUtils";
import {
    invalidateWishlistCache,
    removeBookFromWishlistCache,
    setWishlistCache,
} from "@/api/queryCache";
import { queryKeys } from "@/api/queryKeys";

interface RemoveBookContext {
    previousBooks?: Book[];
    hadPreviousBooks: boolean;
}

interface BookActionsMenuProps {
    book: Book;
    showWishlistRemove?: boolean;
    edge?: "start" | "end" | false;
}

const BookActionsMenu = ({ book, showWishlistRemove, edge = "end" }: BookActionsMenuProps) => {
    const { user } = useUserStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { navigateProtected } = useProtectedNavigation();

    const { mutate: removeFromList, isPending } = useMutation<
        Book[],
        Error,
        void,
        RemoveBookContext
    >({
        mutationFn: () => ListsService.removeBookFromWishlist(getBookId(book)),
        onMutate: async () => {
            if (!showWishlistRemove) return { hadPreviousBooks: false };
            const queryKey = queryKeys.wishlist(user.username);
            await queryClient.cancelQueries({ queryKey });
            const previousBooks = queryClient.getQueryData<Book[]>(queryKey);
            const hadPreviousBooks = previousBooks !== undefined;
            removeBookFromWishlistCache(queryClient, user.username, book);

            return { previousBooks, hadPreviousBooks };
        },
        onSuccess: (updatedBooks) => {
            setWishlistCache(queryClient, user.username, updatedBooks);
            invalidateWishlistCache(queryClient, user.username);
            enqueueSnackbar("Book removed from wishlist", { variant: "success" });
            handleClose();
        },
        onError: (_error, _variables, context) => {
            if (showWishlistRemove && context?.hadPreviousBooks) {
                setWishlistCache(queryClient, user.username, context.previousBooks ?? []);
            }
            enqueueSnackbar("Failed to remove book from wishlist", { variant: "error" });
        },
        onSettled: () => {
            if (showWishlistRemove) {
                invalidateWishlistCache(queryClient, user.username);
            }
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
        if (showWishlistRemove) {
            removeFromList();
        }
    };

    const handleViewDetails = (event: React.MouseEvent) => {
        event.stopPropagation();
        navigate(`/books/${getBookId(book)}`);
        handleClose();
    };

    const handleWriteReview = (event: React.MouseEvent) => {
        event.stopPropagation();
        const didNavigate = navigateProtected(`/post/create/${getBookId(book)}`, {
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
