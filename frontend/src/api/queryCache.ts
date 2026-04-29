import type { QueryClient } from "@tanstack/react-query";
import type { Book } from "@/models/Book";
import type { ReviewComment, UserReview } from "@/models/UserReview";
import type { UserDto } from "@shared/dtos/user.dto";
import { queryKeys, authScopedQueryKeys } from "./queryKeys";
import { getBookId } from "@/utils/bookUtils";
import { applyUserToReviews, applyUserToReview } from "@/utils/reviewUtils";

const updateReviewLikes = (
  review: UserReview | undefined,
  reviewId: string,
  likes: string[],
): UserReview | undefined =>
  review && review._id === reviewId ? { ...review, likes } : review;

const updateReviewComments = (
  review: UserReview | undefined,
  reviewId: string,
  comments: ReviewComment[],
): UserReview | undefined =>
  review && review._id === reviewId ? { ...review, comments } : review;

export const syncReviewLikesInCaches = (
  queryClient: QueryClient,
  reviewId: string,
  likes: string[],
) => {
  queryClient.setQueriesData<UserReview[]>(
    { queryKey: queryKeys.allReviews },
    (reviews) =>
      reviews?.map((review) =>
        review._id === reviewId ? { ...review, likes } : review,
      ),
  );
  queryClient.setQueriesData<UserReview>(
    { queryKey: queryKeys.reviewPrefix },
    (review) => updateReviewLikes(review, reviewId, likes),
  );
};

export const syncReviewCommentsInCaches = (
  queryClient: QueryClient,
  reviewId: string,
  comments: ReviewComment[],
) => {
  queryClient.setQueriesData<UserReview[]>(
    { queryKey: queryKeys.allReviews },
    (reviews) =>
      reviews?.map((review) =>
        review._id === reviewId ? { ...review, comments } : review,
      ),
  );
  queryClient.setQueriesData<UserReview>(
    { queryKey: queryKeys.reviewPrefix },
    (review) => updateReviewComments(review, reviewId, comments),
  );
};

export const invalidateAuthReviewState = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.allReviews });
  queryClient.invalidateQueries({ queryKey: queryKeys.reviewPrefix });
};

export const clearAuthScopedQueries = (queryClient: QueryClient) => {
  authScopedQueryKeys.forEach((queryKey) => {
    queryClient.removeQueries({ queryKey });
  });
};

export const invalidateReviewCaches = (
  queryClient: QueryClient,
  options: { reviewId?: string; bookId?: string } = {},
) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.reviews });
  queryClient.invalidateQueries({ queryKey: queryKeys.allReviews });

  if (options.bookId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.reviewsByBook(options.bookId),
    });
  }

  if (options.reviewId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.review(options.reviewId),
    });
  }
};

export const syncUpdatedUserInReviewCaches = (
  queryClient: QueryClient,
  user: UserDto,
) => {
  queryClient.setQueriesData<UserReview[]>(
    { queryKey: queryKeys.allReviews },
    (reviews) => applyUserToReviews(reviews, user),
  );
  queryClient.setQueriesData<UserReview>(
    { queryKey: queryKeys.reviewPrefix },
    (review) => (review ? applyUserToReview(review, user) : review),
  );
  queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
  invalidateAuthReviewState(queryClient);
};

export const setWishlistCache = (
  queryClient: QueryClient,
  username: string,
  books: Book[],
) => {
  queryClient.setQueryData(queryKeys.wishlist(username), books);
};

export const addBookToWishlistCache = (
  queryClient: QueryClient,
  username: string,
  book: Book,
) => {
  queryClient.setQueryData<Book[]>(
    queryKeys.wishlist(username),
    (currentBooks) => {
      const books = currentBooks ?? [];
      const bookId = getBookId(book);
      const alreadyAdded = books.some(
        (currentBook) => getBookId(currentBook) === bookId,
      );

      return alreadyAdded ? books : [...books, book];
    },
  );
};

export const removeBookFromWishlistCache = (
  queryClient: QueryClient,
  username: string,
  book: Book,
) => {
  queryClient.setQueryData<Book[]>(
    queryKeys.wishlist(username),
    (currentBooks) =>
      currentBooks?.filter(
        (currentBook) => getBookId(currentBook) !== getBookId(book),
      ) ?? [],
  );
};

export const invalidateWishlistCache = (
  queryClient: QueryClient,
  username: string,
) => {
  queryClient.invalidateQueries({
    queryKey: queryKeys.wishlist(username),
  });
};
