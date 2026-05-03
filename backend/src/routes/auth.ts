import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { authenticator } from '@otplib/preset-default';
import { findMailUserByEmail, findMailUserById, mailUserWithoutPassword } from '../db/mailUsers';
import { verifyDovecotPassword } from '../utils/verifyDovecotPassword';
import { pool } from '../config/database';

const router = Router();
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];

function sessionUserFromMailUser(user: any) {
  const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
  
  return {
    id: user.id,
    email: user.email,
    domain_id: user.domain_id,
    maildir: user.maildir,
    isAdmin,
  };
}

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

  if ((user as any).twofa_enabled) {
    req.session.pending2faUserId = user.id;
    return res.json({
      requires2fa: true,
      message: '2FA code required',
    });
  }

  req.session.user = sessionUserFromMailUser(user);

  res.json({
    message: 'Login successful',
    user: {
      ...mailUserWithoutPassword(user),
      isAdmin: req.session.user.isAdmin,
    },
  });
});

// POST /api/auth/2fa/verify
router.post('/2fa/verify', async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!req.session.pending2faUserId) {
    return res.status(401).json({ error: 'No pending 2FA login' });
  }

  const user = await findMailUserById(req.session.pending2faUserId);
  if (!user || !(user as any).twofa_enabled || !(user as any).twofa_secret) {
    return res.status(401).json({ error: 'Invalid 2FA login' });
  }

  const submittedCode = String(code || '').trim();

  const totpValid = authenticator.check(submittedCode, (user as any).twofa_secret);

  let backupCodeValid = false;

  if (!totpValid) {
    const [rows] = await pool.execute(
      'SELECT id, code_hash FROM user_backup_codes WHERE user_id = ? AND used_at IS NULL',
      [user.id]
    );

    for (const row of rows as { id: number; code_hash: string }[]) {
      const match = await bcrypt.compare(submittedCode.toUpperCase(), row.code_hash);
      if (match) {
        await pool.execute('UPDATE user_backup_codes SET used_at = NOW() WHERE id = ?', [row.id]);
        backupCodeValid = true;
        break;
      }
    }
  }

  if (!totpValid && !backupCodeValid) {
    return res.status(401).json({ error: 'Invalid 2FA code' });
  }

  delete req.session.pending2faUserId;

  req.session.user = sessionUserFromMailUser(user);

  res.json({
    message: 'Login successful',
    user: {
      ...mailUserWithoutPassword(user),
      isAdmin: req.session.user.isAdmin,
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
router.get('/me', async (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const isAdmin = ADMIN_EMAILS.includes(req.session.user.email.toLowerCase());
  const dbUser = await findMailUserById(req.session.user.id);

  const user = {
    ...req.session.user,
    isAdmin,
    twofa_enabled: !!(dbUser as any)?.twofa_enabled,
  };

  res.json({ user });
});

export default router;
