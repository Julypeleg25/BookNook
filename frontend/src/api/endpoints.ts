export const endpoints = {
  auth: {
    register: "/auth/register",
    login: "/login",
    refresh: "/auth/refresh",
    me: "/auth/me",
    logout: "/auth/logout",
  },

  users: {
    me: "/users/me",
    updateMe: "/users/me"
  },

  books: {
    getAll: "/books",
    byId: (externalBookId: string) => `/books/${externalBookId}`,
  },

  lists: {
    addBook: (bookId: string) => `/lists/${bookId}`,
    wishlist: "/lists/wishlist",
    readlist: "/lists/readlist",
  },

  reviews: {
    getAll: "/reviews",
    byId: (reviewId: string) => `/reviews/${reviewId}`,
    byUser: (userId: string) => `/reviews/user/${userId}`,
    like: (reviewId: string) => `/reviews/${reviewId}/like`,
    create: "/reviews"
  },
} as const;
