export const endpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    refresh: "/auth/refresh",
    me: "/api/users/me",
    logout: "/auth/logout",
    googleRegister: "/auth/google",
  },

  users: {
    me: "/api/users/me",
    updateMe: "/api/users/me",
  },

  books: {
    search: "/api/books",
    byId: (externalBookId: string) => `/api/books/${externalBookId}`,
  },

  wishlist: {
    addToWishlist: (bookId: string) => `/api/lists/${bookId}`,
    wishlist: "/api/lists/wishlist",
    removeFromWishlist: (bookId: string) => `/api/lists/${bookId}`,
  },

  userReviews: {
    getAll: "/userReviews",
    create: "/userReviews",
    byId: (reviewId: string) => `/userReviews/${reviewId}`,
    getById: (reviewId: string) => `/userReviews/${reviewId}`,
    byUser: (userId: string) => `/userReviews/user/${userId}`,
    byBook: (bookId: string) => `/userReviews/book/${bookId}`,
    like: (reviewId: string) => `/userReviews/${reviewId}/like`,
    unlike: (reviewId: string) => `/userReviews/${reviewId}/unlike`,
    comments: (reviewId: string) => `/userReviews/${reviewId}/comments`,
    deleteComment: (reviewId: string, commentId: string) =>
      `/userReviews/${reviewId}/comments/${commentId}`,
    delete: (reviewId: string) => `/userReviews/${reviewId}`,
  },
  rag: {
    query: "/api/rag/query",
  },
} as const;
