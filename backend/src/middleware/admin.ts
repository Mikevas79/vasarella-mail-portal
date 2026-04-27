import { Request, Response, NextFunction } from 'express';

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const userEmail = req.session.user.email.toLowerCase();
  if (!ADMIN_EMAILS.includes(userEmail)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}