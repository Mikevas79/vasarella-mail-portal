import { Router, Request, Response } from 'express';
import { findMailUserByEmail, mailUserWithoutPassword } from '../db/mailUsers';
import { verifyDovecotPassword } from '../utils/verifyDovecotPassword';

const router = Router();

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
  req.session.user = {
    id: user.id,
    email: user.email,
    domain_id: user.domain_id,
    maildir: user.maildir,
  };

  res.json({
    message: 'Login successful',
    user: mailUserWithoutPassword(user),
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

  res.json({
    user: req.session.user,
  });
});

export default router;