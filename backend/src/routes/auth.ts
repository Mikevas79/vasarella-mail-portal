import { Router, Request, Response } from 'express';
import { findMailUserByEmail, mailUserWithoutPassword } from '../db/mailUsers';
import { verifyDovecotPassword } from '../utils/verifyDovecotPassword';

const router = Router();
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await findMailUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const verification = await verifyDovecotPassword(password, user.password);
  if (!verification.success) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Set user in session
  const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
  req.session.user = {
    id: user.id,
    email: user.email,
    domain_id: user.domain_id,
    maildir: user.maildir,
    isAdmin,
  };

  res.json({
    message: 'Login successful',
    user: {
      ...mailUserWithoutPassword(user),
      isAdmin,
    },
  });
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// GET /api/auth/me
router.get('/me', (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const isAdmin = ADMIN_EMAILS.includes(req.session.user.email.toLowerCase());
  const user = {
    ...req.session.user,
    isAdmin,
  };

  res.json({
    user,
  });
});

export default router;