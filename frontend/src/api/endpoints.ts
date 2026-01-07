export const endpoints = {
  auth: {
    register: "/register",
    login: "/oauth2/redirect/google",//todo change back
    refresh: "/refresh",
    me: "/api/users/me",
    logout: "/logout",
    googleRegister: "/google",
  },

  users: {
    me: "/api/users/me",
    updateMe: "/api/users/me",
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
    create: "/reviews",
  },
} as const;
