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

  lists: {
    addBook: (bookId: string) => `/api/lists/${bookId}`,
    wishlist: "/api/lists/wishlist",
    readlist: "/api/lists/readlist",
  },

  reviews: {
    getAll: "/userReviews",
    byId: (reviewId: string) => `/userReviews/${reviewId}`,
    byUser: (userId: string) => `/userReviews/user/${userId}`,
    like: (reviewId: string) => `/userReviews/${reviewId}/like`,
    create: "/userReviews",
  },
} as const;
