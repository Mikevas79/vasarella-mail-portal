import 'express-session';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
    }

    interface Request {
      session: Session & Partial<SessionData>;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
    };
  }
}