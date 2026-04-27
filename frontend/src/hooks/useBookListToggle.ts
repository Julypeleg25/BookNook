import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { ListsService } from "@/api/services/ListsService";
import {
  addBookToListCache,
  invalidateBookListCache,
  removeBookFromListCache,
  setBookListCache,
} from "@/api/queryCache";
import { queryKeys } from "@/api/queryKeys";
import type { Book } from "@/models/Book";
import {
  BOOK_LIST_LABELS,
  type BookListType,
} from "@/models/List";
import useUserStore from "@/state/useUserStore";
import { getBookId } from "@/utils/bookUtils";

interface UseBookListToggleOptions {
  book: Book;
  listType: BookListType;
  enabled: boolean;
}

interface BookListMutationContext {
  previousBooks?: Book[];
  hadPreviousBooks: boolean;
}

export const useBookListToggle = ({
  book,
  listType,
  enabled,
}: UseBookListToggleOptions) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useUserStore();
  const username = user.username;
  const listQueryKey = queryKeys.listByType(username, listType);
  const bookId = getBookId(book);

  const { data: books = [], isLoading: isListLoading } = useQuery({
    queryKey: listQueryKey,
    queryFn: () =>
      listType === "wish"
        ? ListsService.getWishlistBooks()
        : ListsService.getReadlistBooks(),
    enabled: enabled && Boolean(username),
  });

  const isAdded = books.some((currentBook) => getBookId(currentBook) === bookId);

  const mutation = useMutation<
    Book[],
    Error,
    boolean,
    BookListMutationContext
  >({
    mutationFn: (shouldRemove) =>
      shouldRemove
        ? ListsService.removeBookFromList(bookId, listType)
        : ListsService.addBookToList(bookId, listType),
    onMutate: async (shouldRemove) => {
      await queryClient.cancelQueries({ queryKey: listQueryKey });
      const previousBooks = queryClient.getQueryData<Book[]>(listQueryKey);
      const hadPreviousBooks = previousBooks !== undefined;

      if (shouldRemove) {
        removeBookFromListCache(queryClient, username, listType, book);
      } else {
        addBookToListCache(queryClient, username, listType, book);
      }

      return { previousBooks, hadPreviousBooks };
    },
    onSuccess: (updatedBooks) => {
      setBookListCache(queryClient, username, listType, updatedBooks);
    },
    onError: (_error, _shouldRemove, context) => {
      if (context?.hadPreviousBooks) {
        setBookListCache(queryClient, username, listType, context.previousBooks ?? []);
      } else {
        queryClient.removeQueries({ queryKey: listQueryKey });
      }

      enqueueSnackbar(`Could not update ${BOOK_LIST_LABELS[listType]}`, {
        variant: "error",
      });
    },
    onSettled: () => {
      invalidateBookListCache(queryClient, username, listType);
    },
  });

  const toggle = () => mutation.mutate(isAdded);

  return {
    isAdded,
    isLoading: isListLoading || mutation.isPending,
    toggle,
  };
};
