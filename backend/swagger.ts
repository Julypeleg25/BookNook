const errorResponse = {
  type: "object",
  properties: {
    message: { type: "string" },
    error: { type: "string" },
  },
};

const messageResponse = {
  type: "object",
  properties: {
    message: { type: "string" },
  },
};

const authSecurity = [{ bearerAuth: [] }];

const idParam = (name: string, description: string) => ({
  in: "path",
  name,
  required: true,
  schema: { type: "string" },
  description,
});

const jsonRequest = (schema: object) => ({
  required: true,
  content: {
    "application/json": {
      schema,
    },
  },
});

const multipartRequest = (schema: object, required = true) => ({
  required,
  content: {
    "multipart/form-data": {
      schema,
    },
  },
});

const ok = (description: string, schema?: object) => ({
  description,
  ...(schema
    ? {
        content: {
          "application/json": {
            schema,
          },
        },
      }
    : {}),
});

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "BookNook API",
    version: "1.0.0",
    description: "API documentation for BookNook",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
  tags: [
    { name: "Auth" },
    { name: "Books" },
    { name: "Reviews" },
    { name: "Wishlist" },
    { name: "Users" },
    { name: "RAG" },
    { name: "Health" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Error: errorResponse,
      Message: messageResponse,
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          _id: { type: "string" },
          username: { type: "string" },
          email: { type: "string" },
          name: { type: "string" },
          avatar: { type: "string" },
          provider: { type: "string" },
          wishlist: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      BookSummary: {
        type: "object",
        properties: {
          id: { type: "string" },
          _id: { type: "string" },
          title: { type: "string" },
          subtitle: { type: "string" },
          authors: {
            type: "array",
            items: { type: "string" },
          },
          description: { type: "string" },
          publishedDate: { type: "string" },
          pageCount: { type: "integer" },
          categories: {
            type: "array",
            items: { type: "string" },
          },
          genres: {
            type: "array",
            items: { type: "string" },
          },
          thumbnail: { type: "string" },
          previewLink: { type: "string" },
          averageRating: { type: "number" },
          reviewCount: { type: "integer" },
        },
      },
      BooksSearchResponse: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/BookSummary" },
          },
          page: { type: "integer" },
          limit: { type: "integer" },
          totalItems: { type: "integer" },
          hasNextPage: { type: "boolean" },
        },
      },
      Comment: {
        type: "object",
        properties: {
          id: { type: "string" },
          _id: { type: "string" },
          content: { type: "string" },
          createdDate: { type: "string", format: "date-time" },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      Review: {
        type: "object",
        properties: {
          id: { type: "string" },
          _id: { type: "string" },
          review: { type: "string" },
          rating: { type: "number" },
          picturePath: { type: "string" },
          createdDate: { type: "string", format: "date-time" },
          updatedDate: { type: "string", format: "date-time" },
          book: {
            oneOf: [
              { type: "string" },
              { $ref: "#/components/schemas/BookSummary" },
            ],
          },
          user: { $ref: "#/components/schemas/User" },
          likes: {
            type: "array",
            items: { type: "string" },
          },
          comments: {
            type: "array",
            items: { $ref: "#/components/schemas/Comment" },
          },
        },
      },
      RagResponse: {
        type: "object",
        properties: {
          answer: { type: "string" },
          sourceCount: { type: "integer" },
          sources: {
            type: "array",
            items: { type: "object" },
          },
        },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        responses: {
          "200": ok("API is healthy", {
            type: "object",
            properties: {
              status: { type: "string", example: "ok" },
            },
          }),
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a user",
        requestBody: multipartRequest({
          type: "object",
          required: ["username", "email", "password"],
          properties: {
            username: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
            avatar: { type: "string", format: "binary" },
          },
        }),
        responses: {
          "201": ok("User registered", { $ref: "#/components/schemas/AuthResponse" }),
          "400": ok("Invalid input", { $ref: "#/components/schemas/Error" }),
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in a user",
        requestBody: jsonRequest({
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string" },
            password: { type: "string", format: "password" },
          },
        }),
        responses: {
          "200": ok("User logged in", { $ref: "#/components/schemas/AuthResponse" }),
          "401": ok("Invalid credentials", { $ref: "#/components/schemas/Error" }),
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh the access token",
        responses: {
          "200": ok("Access token refreshed", {
            type: "object",
            properties: {
              accessToken: { type: "string" },
            },
          }),
          "401": ok("Missing or invalid refresh token", { $ref: "#/components/schemas/Error" }),
        },
      },
    },
    "/auth/google": {
      post: {
        tags: ["Auth"],
        summary: "Sign in with Google",
        requestBody: jsonRequest({
          type: "object",
          required: ["credential"],
          properties: {
            credential: { type: "string" },
          },
        }),
        responses: {
          "200": ok("User authenticated", { $ref: "#/components/schemas/AuthResponse" }),
          "400": ok("Missing credential", { $ref: "#/components/schemas/Error" }),
          "401": ok("Invalid Google token", { $ref: "#/components/schemas/Error" }),
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Log out the current user",
        security: authSecurity,
        responses: {
          "200": ok("User logged out", {
            type: "object",
            properties: {
              success: { type: "boolean" },
            },
          }),
        },
      },
    },
    "/api/books": {
      get: {
        tags: ["Books"],
        summary: "Search books",
        security: authSecurity,
        parameters: [
          { in: "query", name: "title", schema: { type: "string" } },
          { in: "query", name: "author", schema: { type: "string" } },
          { in: "query", name: "subject", schema: { type: "string" } },
          { in: "query", name: "page", schema: { type: "integer", minimum: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", minimum: 1 } },
          { in: "query", name: "rating", schema: { type: "number", minimum: 0, maximum: 5 } },
          { in: "query", name: "reviewCount", schema: { type: "integer", minimum: 0 } },
        ],
        responses: {
          "200": ok("Books returned", { $ref: "#/components/schemas/BooksSearchResponse" }),
          "400": ok("Invalid search filters", { $ref: "#/components/schemas/Error" }),
        },
      },
    },
    "/api/books/{externalBookId}": {
      get: {
        tags: ["Books"],
        summary: "Get book details",
        security: authSecurity,
        parameters: [idParam("externalBookId", "External book ID")],
        responses: {
          "200": ok("Book returned", {
            type: "object",
            properties: {
              book: { $ref: "#/components/schemas/BookSummary" },
            },
          }),
          "404": ok("Book not found", { $ref: "#/components/schemas/Error" }),
        },
      },
    },
    "/userReviews": {
      get: {
        tags: ["Reviews"],
        summary: "Get reviews",
        parameters: [
          { in: "query", name: "minLikes", schema: { type: "integer", minimum: 0 } },
          { in: "query", name: "searchQuery", schema: { type: "string" } },
          { in: "query", name: "username", schema: { type: "string" } },
          { in: "query", name: "rating", schema: { type: "number", minimum: 0, maximum: 5 } },
          { in: "query", name: "genre", schema: { type: "string" } },
        ],
        responses: {
          "200": ok("Reviews returned", {
            type: "array",
            items: { $ref: "#/components/schemas/Review" },
          }),
        },
      },
      post: {
        tags: ["Reviews"],
        summary: "Create a review",
        security: authSecurity,
        requestBody: multipartRequest({
          type: "object",
          required: ["bookId", "rating", "review", "picture"],
          properties: {
            bookId: { type: "string" },
            rating: { type: "number", minimum: 0.5, maximum: 5 },
            review: { type: "string" },
            picture: { type: "string", format: "binary" },
          },
        }),
        responses: {
          "201": ok("Review created", { $ref: "#/components/schemas/Review" }),
          "400": ok("Invalid review input", { $ref: "#/components/schemas/Error" }),
          "401": ok("Authentication required", { $ref: "#/components/schemas/Error" }),
        },
      },
    },
    "/userReviews/user/{userId}": {
      get: {
        tags: ["Reviews"],
        summary: "Get reviews by user",
        parameters: [idParam("userId", "User ID")],
        responses: {
          "200": ok("Reviews returned", {
            type: "array",
            items: { $ref: "#/components/schemas/Review" },
          }),
        },
      },
    },
    "/userReviews/book/{bookId}": {
      get: {
        tags: ["Reviews"],
        summary: "Get reviews by book",
        parameters: [idParam("bookId", "Book ID")],
        responses: {
          "200": ok("Reviews returned", {
            type: "array",
            items: { $ref: "#/components/schemas/Review" },
          }),
        },
      },
    },
    "/userReviews/{id}": {
      get: {
        tags: ["Reviews"],
        summary: "Get a review",
        parameters: [idParam("id", "Review ID")],
        responses: {
          "200": ok("Review returned", { $ref: "#/components/schemas/Review" }),
          "404": ok("Review not found", { $ref: "#/components/schemas/Error" }),
        },
      },
      patch: {
        tags: ["Reviews"],
        summary: "Update a review",
        security: authSecurity,
        parameters: [idParam("id", "Review ID")],
        requestBody: multipartRequest({
          type: "object",
          properties: {
            rating: { type: "number", minimum: 0.5, maximum: 5 },
            review: { type: "string" },
            picture: { type: "string", format: "binary" },
          },
        }, false),
        responses: {
          "200": ok("Review updated", { $ref: "#/components/schemas/Review" }),
          "403": ok("Only the review author can update it", { $ref: "#/components/schemas/Error" }),
          "404": ok("Review not found", { $ref: "#/components/schemas/Error" }),
        },
      },
      delete: {
        tags: ["Reviews"],
        summary: "Delete a review",
        security: authSecurity,
        parameters: [idParam("id", "Review ID")],
        responses: {
          "200": ok("Review deleted", { $ref: "#/components/schemas/Message" }),
          "403": ok("Only the review author can delete it", { $ref: "#/components/schemas/Error" }),
          "404": ok("Review not found", { $ref: "#/components/schemas/Error" }),
        },
      },
    },
    "/userReviews/{id}/like": {
      post: {
        tags: ["Reviews"],
        summary: "Like a review",
        security: authSecurity,
        parameters: [idParam("id", "Review ID")],
        responses: {
          "200": ok("Review liked", {
            type: "object",
            properties: {
              likes: { type: "integer" },
            },
          }),
        },
      },
    },
    "/userReviews/{id}/unlike": {
      post: {
        tags: ["Reviews"],
        summary: "Unlike a review",
        security: authSecurity,
        parameters: [idParam("id", "Review ID")],
        responses: {
          "200": ok("Review unliked", {
            type: "object",
            properties: {
              likes: { type: "integer" },
            },
          }),
        },
      },
    },
    "/userReviews/{id}/comments": {
      post: {
        tags: ["Reviews"],
        summary: "Add a comment",
        security: authSecurity,
        parameters: [idParam("id", "Review ID")],
        requestBody: jsonRequest({
          type: "object",
          required: ["comment"],
          properties: {
            comment: { type: "string" },
          },
        }),
        responses: {
          "200": ok("Comment added", {
            type: "array",
            items: { $ref: "#/components/schemas/Comment" },
          }),
          "400": ok("Invalid comment", { $ref: "#/components/schemas/Error" }),
        },
      },
    },
    "/userReviews/{id}/comments/{commentId}": {
      delete: {
        tags: ["Reviews"],
        summary: "Delete a comment",
        security: authSecurity,
        parameters: [
          idParam("id", "Review ID"),
          idParam("commentId", "Comment ID"),
        ],
        responses: {
          "200": ok("Comment deleted", {
            type: "array",
            items: { $ref: "#/components/schemas/Comment" },
          }),
          "403": ok("User cannot delete this comment", { $ref: "#/components/schemas/Error" }),
        },
      },
    },
    "/api/wishlist": {
      get: {
        tags: ["Wishlist"],
        summary: "Get current user's wishlist",
        security: authSecurity,
        responses: {
          "200": ok("Wishlist returned", {
            type: "array",
            items: { $ref: "#/components/schemas/BookSummary" },
          }),
          "401": ok("Authentication required", { $ref: "#/components/schemas/Error" }),
        },
      },
    },
    "/api/wishlist/{bookId}": {
      post: {
        tags: ["Wishlist"],
        summary: "Add a book to the wishlist",
        security: authSecurity,
        parameters: [idParam("bookId", "Book ID")],
        responses: {
          "200": ok("Wishlist IDs returned", {
            type: "array",
            items: { type: "string" },
          }),
        },
      },
      delete: {
        tags: ["Wishlist"],
        summary: "Remove a book from the wishlist",
        security: authSecurity,
        parameters: [idParam("bookId", "Book ID")],
        responses: {
          "200": ok("Wishlist IDs returned", {
            type: "array",
            items: { type: "string" },
          }),
        },
      },
    },
    "/api/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get current user",
        security: authSecurity,
        responses: {
          "200": ok("Current user returned", { $ref: "#/components/schemas/User" }),
          "401": ok("Authentication required", { $ref: "#/components/schemas/Error" }),
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update current user",
        security: authSecurity,
        requestBody: multipartRequest({
          type: "object",
          properties: {
            name: { type: "string" },
            username: { type: "string" },
            avatar: { type: "string", format: "binary" },
          },
        }, false),
        responses: {
          "200": ok("User updated", {
            type: "object",
            properties: {
              message: { type: "string" },
              user: { $ref: "#/components/schemas/User" },
            },
          }),
          "400": ok("Invalid user input", { $ref: "#/components/schemas/Error" }),
        },
      },
    },
    "/api/rag/query": {
      post: {
        tags: ["RAG"],
        summary: "Ask the RAG assistant a book question",
        security: authSecurity,
        requestBody: jsonRequest({
          type: "object",
          required: ["query"],
          properties: {
            query: { type: "string" },
          },
        }),
        responses: {
          "200": ok("Assistant response returned", { $ref: "#/components/schemas/RagResponse" }),
          "400": ok("Invalid question", { $ref: "#/components/schemas/Error" }),
          "500": ok("RAG service error", { $ref: "#/components/schemas/Error" }),
        },
      },
    },
  },
} as const;
