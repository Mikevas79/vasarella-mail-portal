import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import QRCode from 'qrcode';
import { authenticator } from '@otplib/preset-default';
import { pool } from '../config/database';

const router = Router();

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

function generateBackupCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part()}-${part()}`;
}

async function generateAndStoreBackupCodes(userId: number) {
  const codes = Array.from({ length: 10 }, generateBackupCode);

  await pool.execute('DELETE FROM user_backup_codes WHERE user_id = ?', [userId]);

  for (const code of codes) {
    const hash = await bcrypt.hash(code, 12);
    await pool.execute(
      'INSERT INTO user_backup_codes (user_id, code_hash) VALUES (?, ?)',
      [userId, hash]
    );
  }

  return codes;
}

// POST /api/2fa/setup/start
router.post('/setup/start', requireAuth, async (req: Request, res: Response) => {
  const user = req.session.user!;
  const secret = authenticator.generateSecret();

  req.session.pendingTwofaSecret = secret;

  const otpauth = authenticator.keyuri(
    user.email,
    'Vasarella Mail Portal',
    secret
  );

  const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

  res.json({
    secret,
    qrCodeDataUrl,
  });
});

// POST /api/2fa/setup/verify
router.post('/setup/verify', requireAuth, async (req: Request, res: Response) => {
  const user = req.session.user!;
  const { code } = req.body;

  const secret = req.session.pendingTwofaSecret;

  if (!secret) {
    return res.status(400).json({ error: 'No pending 2FA setup found' });
  }

  const valid = authenticator.check(String(code || ''), secret);

  if (!valid) {
    return res.status(400).json({ error: 'Invalid 2FA code' });
  }

  await pool.execute(
    'UPDATE users SET twofa_enabled = 1, twofa_secret = ? WHERE id = ?',
    [secret, user.id]
  );

  delete req.session.pendingTwofaSecret;

  const backupCodes = await generateAndStoreBackupCodes(user.id);

  res.json({
    message: '2FA enabled',
    backupCodes,
  });
});

// POST /api/2fa/disable
router.post('/disable', requireAuth, async (req: Request, res: Response) => {
  const user = req.session.user!;

  await pool.execute(
    'UPDATE users SET twofa_enabled = 0, twofa_secret = NULL WHERE id = ?',
    [user.id]
  );

  await pool.execute('DELETE FROM user_backup_codes WHERE user_id = ?', [user.id]);

  res.json({ message: '2FA disabled' });
});

// POST /api/2fa/backup-codes/regenerate
router.post('/backup-codes/regenerate', requireAuth, async (req: Request, res: Response) => {
  const user = req.session.user!;
  const backupCodes = await generateAndStoreBackupCodes(user.id);

  res.json({
    message: 'Backup codes regenerated',
    backupCodes,
  });
});

export default router;
