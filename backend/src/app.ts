import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import './types/session';
import authRoutes from './routes/auth';
import accountRoutes from './routes/account';
import adminRoutes from './routes/admin';
import twofaRoutes from './routes/twofa';


const app = express();
const PORT = process.env.PORT || 3001;
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-key-change-in-production';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';

// Security middlewares
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 attempts per minute
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(express.json());

// Session middleware
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
    },
  })
);

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/2fa', twofaRoutes);

// Apply rate limiting only to login POST
app.use('/api/auth/login', loginLimiter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
