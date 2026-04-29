import type { ISearchFiltersForm } from "@/components/searchFilters/models/SearchFiltersOptions";

export const queryKeys = {
  allReviews: ["allReviews"] as const,
  allReviewsByUserId: (userId: string) => ["allReviews", "user", userId] as const,
  allReviewsSearch: (searchQuery: string, filters: ISearchFiltersForm) =>
    ["allReviews", searchQuery, filters] as const,
  reviewPrefix: ["review"] as const,
  review: (reviewId: string) => ["review", reviewId] as const,
  reviews: ["reviews"] as const,
  reviewsByBook: (bookId: string) => ["reviews", bookId] as const,
  wishlistPrefix: ["wishlist"] as const,
  wishlist: (username: string) => ["wishlist", username] as const,
  booksSearchPrefix: ["booksSearch"] as const,
  booksSearch: (searchQuery: string, filters: ISearchFiltersForm) =>
    ["booksSearch", searchQuery, filters] as const,
  bookPrefix: ["book"] as const,
  book: (bookId: string) => ["book", bookId] as const,
  currentUser: ["currentUser"] as const,
};

export const authScopedQueryKeys = [
  queryKeys.wishlistPrefix,
  queryKeys.reviews,
  queryKeys.allReviews,
  queryKeys.reviewPrefix,
] as const;
