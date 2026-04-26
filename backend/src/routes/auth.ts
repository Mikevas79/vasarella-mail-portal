import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { findUserByEmail, userWithoutPassword } from '../mocks/users';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Set user in session
  req.session.user = {
    id: user.id,
    email: user.email,
  };

  res.json({
    message: 'Login successful',
    user: userWithoutPassword(user),
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