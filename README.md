# Vasarella Mail Portal

A web portal for managing @vasarella.com mail users.

## Tech Stack
- **Frontend**: React + Vite (TypeScript)
- **Backend**: Node.js + Express (TypeScript)
- **Database**: MySQL
- **Authentication**: Session-based login with bcrypt password hashing
- **Config**: dotenv
- **Deployment**: Apache reverse proxy (planned)

## Project Structure
```
vasarella-mail-portal/
├── backend/          # Node.js Express server (TypeScript)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── app.ts
├── frontend/         # React Vite app (TypeScript)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
├── .env.example      # Environment variables template
├── .gitignore        # Git ignore rules
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MySQL
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the TypeScript code:
   ```bash
   npm run build
   ```

4. Copy environment variables:
   ```bash
   cp ../.env.example .env
   ```
   Edit `.env` with your MySQL credentials and session secret.

5. Start the development server:
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:3001

6. For production, after build:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   App will run on http://localhost:5173

### Health Check
Visit http://localhost:3001/health to verify the backend is running.

### Authentication Endpoints
The backend includes session-based authentication with the following endpoints:

- `POST /api/auth/login` - Log in with email and password
- `POST /api/auth/logout` - Log out and destroy session
- `GET /api/auth/me` - Get current authenticated user

#### Mock Login Credentials (Development)
For testing, use these credentials:
- **Email**: `admin@vasarella.com`
- **Password**: `password123`

_These are mock credentials in memory. They will be replaced with a MySQL database in production._

## Future Features
- User registration/login
- Mail user management
- MySQL database integration
- Apache reverse proxy deployment
