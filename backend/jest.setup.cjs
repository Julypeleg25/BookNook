const path = require('path');
process.env.NODE_ENV = 'test';
require('dotenv').config({ path: path.resolve(__dirname, '.env.test'), quiet: true });

jest.mock('@config/config', () => ({
    ENV: {
        NODE_ENV: 'test',
        PORT: 3000,
        MONGODB_URL: 'mongodb://localhost:27017/test',
        FRONTEND_URL: 'http://localhost:5173',
        JWT_ACCESS_SECRET: 'test-access-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        ACCESS_TOKEN_EXPIRES_IN: '15m',
        REFRESH_TOKEN_EXPIRES_IN: '7d',
        COOKIE_SECURE: false,
        GOOGLE_CLIENT_SECRET: 'test-secret',
        GOOGLE_CLIENT_ID: 'test-id',
        GOOGLE_CALLBACK_URL: 'http://localhost:3000/callback',
        SESSION_SECRET: 'test-session-secret',
        GOOGLE_BOOKS_API_KEY: 'test-key',
        GOOGLE_BOOKS_API: 'https://www.googleapis.com/books/v1/volumes',
        PGVECTOR_URL: 'postgresql://localhost:5432/test',
        GEMINI_API_KEY: 'test-gemini-key',
    },
}));
