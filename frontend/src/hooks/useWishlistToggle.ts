import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { WishlistService } from "@/api/services/WishlistService";
import {
  addBookToWishlistCache,
  invalidateWishlistCache,
  removeBookFromWishlistCache,
  setWishlistCache,
} from "@/api/queryCache";
import { queryKeys } from "@/api/queryKeys";
import type { Book } from "@/models/Book";
import useUserStore from "@/state/useUserStore";
import { getBookId } from "@/utils/bookUtils";

interface UseWishlistToggleOptions {
  book: Book;
  enabled: boolean;
}

interface WishlistMutationContext {
  previousBooks?: Book[];
  hadPreviousBooks: boolean;
}

export const useWishlistToggle = ({
  book,
  enabled,
}: UseWishlistToggleOptions) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useUserStore();
  const username = user.username;
  const wishlistQueryKey = queryKeys.wishlist(username);
  const bookId = getBookId(book);

  const { data: books = [], isLoading: isWishlistLoading } = useQuery({
    queryKey: wishlistQueryKey,
    queryFn: WishlistService.getWishlistBooks,
    enabled: enabled && Boolean(username),
  });

  const isAdded = books.some((currentBook) => getBookId(currentBook) === bookId);

  const mutation = useMutation<
    Book[],
    Error,
    boolean,
    WishlistMutationContext
  >({
    mutationFn: (shouldRemove) =>
      shouldRemove
        ? WishlistService.removeBookFromWishlist(bookId)
        : WishlistService.addBookToWishlist(bookId),
    onMutate: async (shouldRemove) => {
      await queryClient.cancelQueries({ queryKey: wishlistQueryKey });
      const previousBooks = queryClient.getQueryData<Book[]>(wishlistQueryKey);
      const hadPreviousBooks = previousBooks !== undefined;

      if (shouldRemove) {
        removeBookFromWishlistCache(queryClient, username, book);
      } else {
        addBookToWishlistCache(queryClient, username, book);
      }

      return { previousBooks, hadPreviousBooks };
    },
    onSuccess: (updatedBooks) => {
      setWishlistCache(queryClient, username, updatedBooks);
    },
    onError: (_error, _shouldRemove, context) => {
      if (context?.hadPreviousBooks) {
        setWishlistCache(queryClient, username, context.previousBooks ?? []);
      } else {
        queryClient.removeQueries({ queryKey: wishlistQueryKey });
      }

      enqueueSnackbar("Could not update Wishlist", {
        variant: "error",
      });
    },
    onSettled: () => {
      invalidateWishlistCache(queryClient, username);
    },
  });

  const toggle = () => mutation.mutate(isAdded);

  return {
    isAdded,
    isLoading: isWishlistLoading || mutation.isPending,
    toggle,
  };
};
