import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      email: string;
      domain_id: number;
      maildir: string;
      isAdmin: boolean;
    };
    pending2faUserId?: number;
    pendingTwofaSecret?: string;
  }
}
