import { useState } from "react";
import type React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import type { Book } from "@models/Book";
import { WishlistService } from "@/api/services/WishlistService";
import {
  invalidateWishlistCache,
  removeBookFromWishlistCache,
  setWishlistCache,
} from "@/api/queryCache";
import { queryKeys } from "@/api/queryKeys";
import { useProtectedNavigation } from "@/hooks/useProtectedNavigation";
import useUserStore from "@/state/useUserStore";
import { getBookId } from "@/utils/bookUtils";

interface RemoveBookContext {
  previousBooks?: Book[];
  hadPreviousBooks: boolean;
}

interface UseBookActionsMenuOptions {
  book: Book;
  showWishlistRemove?: boolean;
}

export const useBookActionsMenu = ({
  book,
  showWishlistRemove,
}: UseBookActionsMenuOptions) => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { navigateProtected } = useProtectedNavigation();

  const handleClose = () => {
    setAnchorEl(null);
  };

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
      state: { book },
    });
    if (didNavigate) {
      handleClose();
    }
  };

  return {
    anchorEl,
    handleClose,
    handleOpen,
    handleRemove,
    handleViewDetails,
    handleWriteReview,
    isPending,
  };
};
