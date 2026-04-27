# BookNook Monorepo

This project is a monorepo containing the backend, frontend, and shared packages for BookNook.

## Structure

- `backend/`: Express.js server (Node.js/TypeScript)
- `frontend/`: React application (Vite/TypeScript)
- `packages/shared/`: Shared TypeScript logic (schemas, types, etc.)

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- MongoDB
- PostgreSQL (with pgvector)
- PM2 (for production)

### Installation

```bash
npm install
```

### Development

Run both backend and frontend in development mode:

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

## Production Deployment

### 1. Build the application

This will build the frontend and then the backend (copying the frontend build to `backend/public`).

```bash
npm run build:all
```

### 2. Configure Environment

Copy `backend/.envprod` to `backend/.env` and update the values with your production configuration.

### 3. Generate Certificates (for HTTPS)

If you need HTTPS support, run:

```bash
cd backend
./scripts/generate-certs.ps1 # On Windows
# OR
./scripts/generate-certs.sh  # On Linux/macOS
```

### 4. Run with PM2

```bash
cd backend
npm run prod
```

## Maintenance Commands

- `npm run lint`: Run linting across the monorepo.
- `npm run test:backend`: Run backend tests.
