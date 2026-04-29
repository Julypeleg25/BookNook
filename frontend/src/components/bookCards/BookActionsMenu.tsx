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
import { WishlistService } from "@/api/services/WishlistService";
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

    const { mutate: removeFromWishlist, isPending } = useMutation<
        Book[],
        Error,
        void,
        RemoveBookContext
    >({
        mutationFn: () => WishlistService.removeBookFromWishlist(getBookId(book)),
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
            removeFromWishlist();
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
