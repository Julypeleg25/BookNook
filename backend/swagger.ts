import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BookNook API',
      version: '1.0.0',
      description: 'API documentation for BookNook',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        BookSummary: {
          type: 'object',
          required: ['id', 'title', 'authors'],
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            authors: {
              type: 'array',
              items: { type: 'string' },
            },
            thumbnail: { type: 'string' },
          },
        },
        BookDetail: {
          type: 'object',
          required: ['id', 'title', 'authors', 'categories'],
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            subtitle: { type: 'string' },
            authors: {
              type: 'array',
              items: { type: 'string' },
            },
            description: { type: 'string' },
            publishedDate: { type: 'string' },
            pageCount: { type: 'integer' },
            categories: {
              type: 'array',
              items: { type: 'string' },
            },
            thumbnail: { type: 'string' },
            previewLink: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
});
