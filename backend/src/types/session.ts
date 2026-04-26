import 'express-session';

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      domain_id: number;
      maildir: string;
    }

    interface Request {
      session: Session & Partial<SessionData>;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      email: string;
      domain_id: number;
      maildir: string;
    };
  }
}