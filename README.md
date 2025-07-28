# NestJS User and Document Management System

A backend application for user authentication, document management, and ingestion control with role-based access.

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v12+)

### Setup
1. Clone the repo and install dependencies:
   ```bash
   git clone <repository-url>
   cd jk_assignment
   npm install
   ```
2. Create a `.env` file in the root:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database_name
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   PORT=3000
   NODE_ENV=development
   ```
3. Start the app:
   ```bash
   npm run start:dev
   ```

## Usage
- Register and log in users via `/auth/register` and `/auth/login`.
- User management endpoints are under `/users` (admin only).
- Documents and ingestion endpoints follow a similar pattern (see code for details).

## Testing
```bash
npm run test
npm run test:e2e
```

## Project Structure
- `src/auth` - Auth logic (JWT, guards, etc.)
- `src/users` - User management
- `src/app.*` - Main app files

## License
MIT
